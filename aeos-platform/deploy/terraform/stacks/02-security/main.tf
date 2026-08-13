data "aws_caller_identity" "current" {}

# ── KMS Master Key ────────────────────────────────────────────────────────────
# Single KMS key used across all services in this environment (EKS, RDS, Redis, S3).
# Using a single key per environment simplifies policy management and reduces cost.
module "kms" {
  source  = "terraform-aws-modules/kms/aws"
  version = "~> 2.0"

  description = "AEOS ${var.environment} master encryption key"
  key_usage   = "ENCRYPT_DECRYPT"

  aliases = ["aeos/${var.environment}"]

  # Enable rotation — AWS best practice (no cost for CMK rotation)
  enable_key_rotation = true

  tags = var.tags
}

# ── Security Baseline ─────────────────────────────────────────────────────────
module "security_baseline" {
  source = "../../modules/security-baseline"

  name        = "${var.project}-${var.environment}"
  kms_key_arn = module.kms.key_arn
  account_id  = data.aws_caller_identity.current.account_id

  cloudtrail_s3_force_destroy = var.cloudtrail_s3_force_destroy
  cloudtrail_retention_days   = var.cloudtrail_retention_days
  is_multi_region_trail       = var.is_multi_region_trail
  guardduty_finding_frequency = var.guardduty_finding_frequency

  tags = var.tags
}
