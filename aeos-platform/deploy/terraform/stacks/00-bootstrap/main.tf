# ─────────────────────────────────────────────────────────────────────────────
# Stack 00 — Bootstrap
#
# IMPORTANT: This stack is run ONCE by a privileged administrator using LOCAL
# state (do not specify a backend — let Terraform use the default local state).
# After creation, import the S3 bucket into its own state to self-manage.
#
# Purpose: Create the S3 state bucket and DynamoDB lock table that ALL other
# stacks depend on for remote state storage.
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # No backend block here — this stack MUST be applied with local state first
}


data "aws_caller_identity" "current" {}

locals {
  bucket_name = "aeos-terraform-state-${data.aws_caller_identity.current.account_id}"
}

# ── Terraform State Bucket ──────────────────────────────────────────────────
resource "aws_s3_bucket" "terraform_state" {
  bucket = local.bucket_name

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms" # Uses the AWS-managed KMS key by default
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── DynamoDB Lock Table ─────────────────────────────────────────────────────
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST" # No capacity planning needed for state locking
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = { Name = "terraform-locks" }


  lifecycle {
    prevent_destroy = true
  }
}
