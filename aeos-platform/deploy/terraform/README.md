# AEOS Platform — Terraform Infrastructure

## Architecture Overview

This Terraform codebase follows a **Layered Stack + Terragrunt** pattern.
Infrastructure is split into 5 independent state layers, each with its own lifecycle:

```
environments/
├── terragrunt.hcl              ← Root config (backend, provider, common inputs)
├── dev/
│   ├── env.hcl                 ← Dev-specific locals (environment, region, account_id)
│   ├── 01-networking/          ← VPC, subnets, NAT, flow logs
│   ├── 02-security/            ← KMS, GuardDuty, CloudTrail
│   ├── 03-data/                ← Aurora Serverless v2, Redis, S3
│   ├── 04-compute/             ← EKS cluster + node groups
│   └── 05-app-config/          ← IRSA roles, IAM policies
├── staging/
│   └── ...  (identical structure, different values)
└── prod/
    └── ...  (identical structure, production safeguards)

stacks/                         ← Reusable stack definitions (no state)
├── 00-bootstrap/               ← S3 bucket + DynamoDB for state backend
├── 01-networking/
├── 02-security/
├── 03-data/
├── 04-compute/
└── 05-app-config/

modules/                        ← Reusable modules (no state, no provider)
├── networking/                 ← VPC wrapper with opinionated defaults
├── eks-cluster/                ← EKS + EBS CSI IRSA
├── aurora/                     ← Aurora PostgreSQL Serverless v2
├── elasticache/                ← Redis with encryption
├── s3-encrypted/               ← S3 with KMS, versioning, public access block
├── security-baseline/          ← GuardDuty + CloudTrail
├── iam-irsa/                   ← Generic IRSA factory
└── wafv2/                      ← WAFv2 with managed rule groups
```

## Apply Order

> **IMPORTANT**: Due to cross-stack dependencies, apply stacks in this order:

```
01-networking → 02-security → 04-compute → 03-data → 05-app-config
```

Terragrunt handles this automatically with `run-all`:
```bash
cd environments/dev && terragrunt run-all apply
```

## Prerequisites

| Tool        | Version  | Purpose                    |
|-------------|----------|----------------------------|
| Terraform   | >= 1.5   | Infrastructure as Code     |
| Terragrunt  | >= 0.55  | DRY environment management |
| AWS CLI     | v2       | Authentication + kubeconfig|
| tflint      | latest   | Terraform linting          |
| checkov     | latest   | Security policy scanning   |

## Getting Started

### 1. Bootstrap (first time only)

```bash
cd deploy/terraform
make bootstrap
```

Then update `environments/dev/env.hcl` with your actual `account_id`.

### 2. Deploy a single stack

```bash
make plan  ENV=dev STACK=01-networking
make apply ENV=dev STACK=01-networking
```

### 3. Deploy all stacks in an environment

```bash
make apply-all ENV=dev
```

### 4. Update kubeconfig

```bash
make kubeconfig ENV=dev
```

## Key Design Decisions

### Why split state?

| Layer        | Change Frequency | Risk if Applied Together |
|-------------|------------------|--------------------------|
| Networking  | Very rare        | VPC change = downtime    |
| Security    | Rare             | KMS deletion = data loss |
| Data        | Monthly          | DB recreate = data loss  |
| Compute     | Weekly           | EKS upgrade = restart    |
| App Config  | Daily            | Only IAM roles change    |

### Environment Differences

| Setting                  | dev       | staging   | prod      |
|--------------------------|-----------|-----------|-----------|
| NAT Gateways             | 1         | 1         | 1 per AZ  |
| Aurora Min ACU           | 0.5       | 1         | 2         |
| Aurora Max ACU           | 4         | 8         | 32        |
| deletion_protection      | false     | false     | **true**  |
| CloudTrail retention     | 30 days   | 60 days   | 365 days  |
| EKS public access CIDRs  | 0.0.0.0/0 | VPN only  | VPN only  |
| Redis failover           | false     | false     | **true**  |
| GuardDuty frequency      | ONE_HOUR  | ONE_HOUR  | 15 min    |

## State Migration from Monolithic

If migrating from the old `environments/dev/infrastructure.tf` monolithic state:

```bash
# 1. Create new stacks (already done)
# 2. Use `terraform state mv` to move resources between states
# 3. Verify with `terraform plan` — expect "No changes"
# 4. Remove old state entry-by-entry

# Example: move VPC to 01-networking state
terragrunt -chdir=environments/dev/01-networking state mv \
  -state=<old-state> \
  -state-out=<new-networking-state> \
  module.vpc
```

> See [Terraform state mv documentation](https://developer.hashicorp.com/terraform/cli/commands/state/mv) for details.

## Linting & Security

```bash
make fmt           # Format all files
make fmt-check     # Check formatting (for CI)
make lint          # Run tflint
make security-scan # Run tfsec
make checkov-scan  # Run Checkov
```
