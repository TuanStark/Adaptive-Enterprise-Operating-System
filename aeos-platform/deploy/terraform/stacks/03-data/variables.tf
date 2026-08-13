variable "project" {
  description = "Project name"
  type        = string
  default     = "aeos"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
}

variable "account_id" {
  description = "AWS account ID — appended to S3 bucket names for global uniqueness"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID (from 01-networking stack output)"
  type        = string
}

variable "database_subnet_ids" {
  description = "Database subnet IDs (from 01-networking stack output)"
  type        = list(string)
}

variable "eks_node_security_group_ids" {
  description = "EKS node security group IDs that need access to DB and Redis (from 04-compute output)"
  type        = list(string)
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption (from 02-security stack output)"
  type        = string
}

# ── Aurora ────────────────────────────────────────────────────────────────────
variable "aurora_database_name" {
  description = "Initial database name created in the Aurora cluster"
  type        = string
  default     = "aeos"
}

variable "aurora_master_username" {
  description = "Master DB username for Aurora"
  type        = string
  default     = "aeos"
}

variable "aurora_min_acu" {
  description = "Aurora Serverless v2 minimum ACU"
  type        = number
  default     = 0.5
}

variable "aurora_max_acu" {
  description = "Aurora Serverless v2 maximum ACU"
  type        = number
  default     = 4
}

variable "aurora_backup_retention_period" {
  description = "Aurora automated backup retention in days"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Enable deletion protection on Aurora. Must be true in production."
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on Aurora cluster destruction"
  type        = bool
  default     = true
}

# ── Redis ─────────────────────────────────────────────────────────────────────
variable "redis_node_type" {
  description = "ElastiCache node type for Redis"
  type        = string
  default     = "cache.t4g.micro"
}

variable "redis_num_clusters" {
  description = "Number of Redis cache nodes (>1 enables failover)"
  type        = number
  default     = 1
}

variable "redis_failover_enabled" {
  description = "Enable Redis automatic failover (requires redis_num_clusters >= 2)"
  type        = bool
  default     = false
}

# ── S3 ────────────────────────────────────────────────────────────────────────
variable "s3_force_destroy" {
  description = "Allow S3 uploads bucket to be destroyed with objects inside"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
