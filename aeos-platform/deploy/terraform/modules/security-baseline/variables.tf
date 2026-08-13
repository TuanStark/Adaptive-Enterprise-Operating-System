variable "name" {
  description = "Name prefix for all security baseline resources"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN of the KMS key used to encrypt CloudTrail logs and other security data"
  type        = string
}

variable "account_id" {
  description = "AWS account ID — used in the CloudTrail S3 bucket policy"
  type        = string
}

variable "cloudtrail_s3_force_destroy" {
  description = <<-EOT
    Allow destroying the CloudTrail S3 bucket even when it contains logs.
    Set to false in production to prevent accidental evidence destruction.
  EOT
  type        = bool
  default     = true
}

variable "cloudtrail_retention_days" {
  description = "Number of days to retain CloudTrail log files in S3 before expiry"
  type        = number
  default     = 90
}

variable "guardduty_finding_frequency" {
  description = "How often GuardDuty publishes updated findings (SIX_HOURS | ONE_HOUR | FIFTEEN_MINUTES)"
  type        = string
  default     = "FIFTEEN_MINUTES"

  validation {
    condition     = contains(["SIX_HOURS", "ONE_HOUR", "FIFTEEN_MINUTES"], var.guardduty_finding_frequency)
    error_message = "guardduty_finding_frequency must be SIX_HOURS, ONE_HOUR, or FIFTEEN_MINUTES"
  }
}

variable "is_multi_region_trail" {
  description = "Record API calls from all AWS regions. Recommended for production."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Map of tags to apply to all resources in this module"
  type        = map(string)
  default     = {}
}
