# =============================================================================
# AEOS Terraform Makefile
# =============================================================================
# Usage:
#   make plan    ENV=dev  STACK=04-compute
#   make apply   ENV=dev  STACK=04-compute
#   make destroy ENV=dev  STACK=04-compute
#   make plan-all ENV=dev
#   make apply-all ENV=dev
#
# Prerequisites: terraform >= 1.5, terragrunt >= 0.55, aws-cli v2
# =============================================================================

ENV    ?= dev
STACK  ?=
ENVDIR  = environments/$(ENV)

.PHONY: help validate lint fmt plan apply destroy plan-all apply-all \
        state-list state-mv init bootstrap

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Validation ──────────────────────────────────────────────────────────────
validate: ## Run terraform validate on all modules
	@echo "==> Validating modules..."
	@for dir in modules/*/; do \
		echo "  Validating $$dir"; \
		terraform -chdir=$$dir init -backend=false -quiet && \
		terraform -chdir=$$dir validate; \
	done

fmt: ## Format all Terraform files
	terraform fmt -recursive .

fmt-check: ## Check formatting without modifying files (use in CI)
	terraform fmt -recursive -check .

lint: ## Run tflint on all modules and stacks
	@for dir in modules/*/ stacks/*/; do \
		echo "==> Linting $$dir"; \
		tflint --chdir=$$dir; \
	done

# ── Single Stack ─────────────────────────────────────────────────────────────
_require-stack:
	@test -n "$(STACK)" || (echo "ERROR: STACK is required. Example: make plan ENV=dev STACK=04-compute" && exit 1)

init: _require-stack ## Init a specific stack (ENV, STACK required)
	cd $(ENVDIR)/$(STACK) && terragrunt init

plan: _require-stack ## Plan a specific stack (ENV, STACK required)
	cd $(ENVDIR)/$(STACK) && terragrunt plan

apply: _require-stack ## Apply a specific stack (ENV, STACK required)
	cd $(ENVDIR)/$(STACK) && terragrunt apply

destroy: _require-stack ## Destroy a specific stack (ENV, STACK required) — use with caution!
	cd $(ENVDIR)/$(STACK) && terragrunt destroy

# ── All Stacks in an Environment ─────────────────────────────────────────────
plan-all: ## Plan ALL stacks in ENV (respects dependency order)
	@echo "==> Planning all stacks for ENV=$(ENV)"
	cd $(ENVDIR) && terragrunt run-all plan --terragrunt-non-interactive

apply-all: ## Apply ALL stacks in ENV (respects dependency order)
	@echo "==> Applying all stacks for ENV=$(ENV)"
	cd $(ENVDIR) && terragrunt run-all apply --terragrunt-non-interactive

destroy-all: ## Destroy ALL stacks in ENV in reverse order — DANGEROUS
	@echo "==> WARNING: Destroying all stacks for ENV=$(ENV)"
	@read -p "Type 'destroy-$(ENV)' to confirm: " confirm && [ "$$confirm" = "destroy-$(ENV)" ]
	cd $(ENVDIR) && terragrunt run-all destroy --terragrunt-non-interactive --terragrunt-reverse-order

# ── State Management ──────────────────────────────────────────────────────────
state-list: _require-stack ## List all resources in a stack's state
	cd $(ENVDIR)/$(STACK) && terragrunt state list

state-mv: ## Move a resource between states (requires SRC, DST, ADDR)
	@echo "Use: terragrunt state mv -state=<src.tfstate> -state-out=<dst.tfstate> <address>"

# ── Bootstrap (run once) ─────────────────────────────────────────────────────
bootstrap: ## Create S3 state bucket and DynamoDB lock table (run once per account)
	@echo "==> Bootstrapping Terraform state backend..."
	cd stacks/00-bootstrap && terraform init && terraform apply -auto-approve
	@echo "==> Bootstrap complete. Update env.hcl with your account_id and bucket name."

# ── Security Scanning ────────────────────────────────────────────────────────
security-scan: ## Run tfsec security scanner
	tfsec . --tfvars-file /dev/null

checkov-scan: ## Run Checkov policy scanner
	checkov -d . --framework terraform

# ── Output Helpers ────────────────────────────────────────────────────────────
kubeconfig: ## Update local kubeconfig for ENV
	@cd $(ENVDIR)/04-compute && terragrunt output -raw kubeconfig_command | bash

aurora-secret: ## Print Aurora master credentials secret ARN for ENV
	@cd $(ENVDIR)/03-data && terragrunt output -raw aurora_master_user_secret
