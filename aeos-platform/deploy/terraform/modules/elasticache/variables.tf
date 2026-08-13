variable "name" {
  description = "Name for the ElastiCache replication group and associated resources"
  type        = string
}

variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.1"
}

variable "node_type" {
  description = "ElastiCache node type (e.g. cache.t4g.micro for dev, cache.r6g.large for prod)"
  type        = string
  default     = "cache.t4g.micro"
}

variable "num_cache_clusters" {
  description = "Number of cache nodes in the replication group. Set > 1 to enable multi-AZ failover."
  type        = number
  default     = 1
}

variable "automatic_failover_enabled" {
  description = "Enable automatic failover to a replica. Requires num_cache_clusters >= 2."
  type        = bool
  default     = false
}

variable "vpc_id" {
  description = "VPC ID where the ElastiCache cluster will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the ElastiCache subnet group (use database/private subnets)"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "List of security group IDs permitted to connect to Redis on port 6379"
  type        = list(string)
}

variable "kms_key_arn" {
  description = "ARN of the KMS key for at-rest encryption"
  type        = string
}

variable "snapshot_retention_limit" {
  description = "Number of daily snapshots to retain (0 disables snapshots)"
  type        = number
  default     = 3
}

variable "snapshot_window" {
  description = "Daily UTC time range during which snapshots are created (e.g. '05:00-06:00')"
  type        = string
  default     = "05:00-06:00"
}

variable "maintenance_window" {
  description = "Weekly UTC time range for maintenance (e.g. 'mon:06:00-mon:07:00')"
  type        = string
  default     = "mon:06:00-mon:07:00"
}

variable "tags" {
  description = "Map of tags to apply to all resources in this module"
  type        = map(string)
  default     = {}
}
