variable "name" {
  description = "Cluster identifier for the Aurora cluster and associated resources"
  type        = string
}

variable "engine_version" {
  description = "Aurora PostgreSQL engine version"
  type        = string
  default     = "16.4"
}

variable "database_name" {
  description = "Name of the initial database to create inside the cluster"
  type        = string
  default     = "app"
}

variable "master_username" {
  description = "Master username for the Aurora cluster. Avoid using 'admin' (reserved)."
  type        = string
  default     = "dbadmin"
}

variable "vpc_id" {
  description = "VPC ID where the Aurora cluster will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the Aurora DB subnet group (use database subnets)"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "List of security group IDs permitted to connect to the cluster on port 5432"
  type        = list(string)
}

variable "kms_key_arn" {
  description = "ARN of the KMS key for storage and Performance Insights encryption"
  type        = string
}

variable "min_acu" {
  description = "Minimum Aurora Capacity Units for Serverless v2 auto-scaling"
  type        = number
  default     = 0.5
}

variable "max_acu" {
  description = "Maximum Aurora Capacity Units for Serverless v2 auto-scaling"
  type        = number
  default     = 4
}

variable "backup_retention_period" {
  description = "Number of days to retain automated backups (1–35)"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Prevent accidental deletion of the cluster. Must be true in production."
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on cluster destruction. Set to false in production."
  type        = bool
  default     = true
}

variable "apply_immediately" {
  description = "Apply cluster modifications immediately (true) or at next maintenance window (false)"
  type        = bool
  default     = true
}

variable "preferred_backup_window" {
  description = "Daily UTC time window for automated backups (e.g. '03:00-04:00')"
  type        = string
  default     = "03:00-04:00"
}

variable "preferred_maintenance_window" {
  description = "Weekly UTC time window for maintenance operations (e.g. 'mon:04:00-mon:05:00')"
  type        = string
  default     = "mon:04:00-mon:05:00"
}

variable "tags" {
  description = "Map of tags to apply to all resources in this module"
  type        = map(string)
  default     = {}
}
