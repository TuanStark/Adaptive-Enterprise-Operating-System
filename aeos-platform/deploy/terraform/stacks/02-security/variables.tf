variable "project" {
  description = "Project name"
  type        = string
  default     = "aeos"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
}

variable "cloudtrail_s3_force_destroy" {
  description = "Allow destroying the CloudTrail S3 bucket with logs inside. Use false in prod."
  type        = bool
  default     = true
}

variable "cloudtrail_retention_days" {
  description = "Days to retain CloudTrail logs before S3 lifecycle expiry"
  type        = number
  default     = 90
}

variable "is_multi_region_trail" {
  description = "Record API calls from all AWS regions. Recommended for prod."
  type        = bool
  default     = false
}

variable "guardduty_finding_frequency" {
  description = "How often GuardDuty publishes updated findings"
  type        = string
  default     = "FIFTEEN_MINUTES"
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
