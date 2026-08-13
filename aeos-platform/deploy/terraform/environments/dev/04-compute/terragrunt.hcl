include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//04-compute"
}

# NOTE: 04-compute must be applied BEFORE 03-data because 03-data
# needs the EKS node security group ID to create DB ingress rules.
# Apply order: 01-networking → 02-security → 04-compute → 03-data → 05-app-config

dependency "networking" {
  config_path = "../01-networking"
  mock_outputs_merge_strategy_with_state = "shallow"
  mock_outputs = {
    vpc_id          = "vpc-mock-00000000"
    private_subnets = ["subnet-mock-a", "subnet-mock-b"]
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

dependency "security" {
  config_path = "../02-security"
  mock_outputs_merge_strategy_with_state = "shallow"
  mock_outputs = {
    kms_key_arn = "arn:aws:kms:ap-southeast-1:123456789012:key/mock-key-id"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

inputs = {
  vpc_id             = dependency.networking.outputs.vpc_id
  private_subnet_ids = dependency.networking.outputs.private_subnets
  kms_key_arn        = dependency.security.outputs.kms_key_arn

  cluster_version = "1.30"

  # Dev: public endpoint without IP restriction (convenient for development)
  # Change to specific CIDRs for staging/prod
  enable_public_endpoint = true
  public_access_cidrs    = ["0.0.0.0/0"]

  # Dev: minimal node group — single pool, on-demand t3.medium
  node_groups = {
    system = {
      instance_types = ["t3.medium"]
      min_size       = 2
      max_size       = 4
      desired_size   = 2
      labels         = { workload = "system" }
    }
  }
}
