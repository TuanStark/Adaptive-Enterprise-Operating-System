variable "project" {
  description = "Project name"
  type        = string
  default     = "aeos"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
}

variable "cluster_oidc_provider_arn" {
  description = "EKS OIDC provider ARN (from 04-compute stack output)"
  type        = string
}

variable "uploads_bucket_arn" {
  description = "ARN of the S3 uploads bucket (from 03-data stack output)"
  type        = string
}

variable "ses_from_address" {
  description = "Email address allowed as the SES sender for the API service"
  type        = string
  default     = "noreply@aeos.com"
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
