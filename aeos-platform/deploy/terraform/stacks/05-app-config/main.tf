# IAM policies are defined inline here to keep the resource + policy co-located.
# Add new service accounts by adding a new module "xxx_irsa" block following the pattern below.

# ── IAM Policy: API → S3 ────────────────────────────────────────────────────
resource "aws_iam_policy" "api_s3" {
  name        = "${var.project}-${var.environment}-api-s3"
  description = "Allows the aeos-api service to read/write the uploads S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid      = "UploadsAccess"
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"]
      Resource = [var.uploads_bucket_arn, "${var.uploads_bucket_arn}/*"]
    }]
  })

  tags = var.tags
}

# ── IAM Policy: API → SES ────────────────────────────────────────────────────
resource "aws_iam_policy" "api_ses" {
  name        = "${var.project}-${var.environment}-api-ses"
  description = "Allows the aeos-api service to send email via SES from a specific address"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid      = "SESFromAddress"
      Effect   = "Allow"
      Action   = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = ["*"]
      Condition = {
        StringEquals = { "ses:FromAddress" = var.ses_from_address }
      }
    }]
  })

  tags = var.tags
}

# ── IRSA: aeos-api ────────────────────────────────────────────────────────────
module "api_irsa" {
  source = "../../modules/iam-irsa"

  name              = "${var.project}-${var.environment}-api"
  oidc_provider_arn = var.cluster_oidc_provider_arn

  # The Kubernetes ServiceAccount "aeos-api" in namespace "aeos" gets this role
  namespace_service_accounts = ["aeos:aeos-api"]

  policy_arns = {
    s3  = aws_iam_policy.api_s3.arn
    ses = aws_iam_policy.api_ses.arn
  }

  tags = var.tags
}
