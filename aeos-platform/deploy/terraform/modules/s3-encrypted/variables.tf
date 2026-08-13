variable "bucket_name" {
  description = "Globally unique name for the S3 bucket"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN of the KMS key used for server-side encryption"
  type        = string
}

variable "enable_versioning" {
  description = "Enable S3 object versioning"
  type        = bool
  default     = true
}

variable "force_destroy" {
  description = <<-EOT
    Allow destroying the bucket even when it contains objects.
    Set to false in production to prevent accidental data loss.
  EOT
  type        = bool
  default     = false
}

variable "lifecycle_rules" {
  description = "List of lifecycle rules for automated object management"
  type = list(object({
    id                                 = string
    enabled                            = bool
    expiration_days                    = optional(number)
    noncurrent_version_expiration_days = optional(number)
  }))
  default = []
}

variable "cors_rules" {
  description = "Optional CORS rules for the bucket (e.g., for direct browser uploads)"
  type = list(object({
    allowed_headers = optional(list(string), ["*"])
    allowed_methods = list(string)
    allowed_origins = list(string)
    expose_headers  = optional(list(string), [])
    max_age_seconds = optional(number, 3000)
  }))
  default = []
}

variable "tags" {
  description = "Map of tags to apply to all resources in this module"
  type        = map(string)
  default     = {}
}
