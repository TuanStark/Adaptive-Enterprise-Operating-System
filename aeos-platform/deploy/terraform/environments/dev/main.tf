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

  backend "s3" {
    bucket         = "aeos-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "aeos"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Data source for current account
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
