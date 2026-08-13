# =============================================================================
# ROOT terragrunt.hcl
# =============================================================================
# This file is the single source of truth for:
#   - Remote state configuration (S3 backend + DynamoDB locking)
#   - AWS provider generation
#   - Common inputs shared across ALL stacks in ALL environments
#
# Every environment's terragrunt.hcl files inherit from this via:
#   include "root" { path = find_in_parent_folders() }
# =============================================================================

locals {
  # Load environment-specific locals from the nearest env.hcl file
  # (environments/<env>/env.hcl)
  env_vars    = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  environment = local.env_vars.locals.environment
  region      = local.env_vars.locals.region
  account_id  = local.env_vars.locals.account_id
  project     = "aeos"
}

# =============================================================================
# Remote State — S3 backend auto-generated per stack
# Key format: <env>/<stack-relative-path>/terraform.tfstate
# Example:    dev/04-compute/terraform.tfstate
# =============================================================================
remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket         = "aeos-terraform-state-${local.account_id}"
    key            = "${local.environment}/${path_relative_to_include()}/terraform.tfstate"
    region         = local.region
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# =============================================================================
# Provider Generation — creates provider.tf in each stack's .terragrunt-cache
# =============================================================================
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    terraform {
      required_version = ">= 1.5"
      required_providers {
        aws = {
          source  = "hashicorp/aws"
          version = "~> 5.0"
        }
        kubernetes = {
          source  = "hashicorp/kubernetes"
          version = "~> 2.25"
        }
        helm = {
          source  = "hashicorp/helm"
          version = "~> 2.12"
        }
      }
    }

    provider "aws" {
      region = "${local.region}"

      default_tags {
        tags = {
          Project     = "${local.project}"
          Environment = "${local.environment}"
          ManagedBy   = "terragrunt"
        }
      }
    }
  EOF
}

# =============================================================================
# Common Inputs — passed to every stack automatically
# =============================================================================
inputs = {
  project     = local.project
  environment = local.environment
  account_id  = local.account_id
  tags = {
    Project     = local.project
    Environment = local.environment
    ManagedBy   = "terragrunt"
  }
}
