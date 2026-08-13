variable "region" {
  description = "AWS region to deploy all resources into"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name — used as a suffix on all resource names and as a tag value"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod"
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC (e.g. 10.0.0.0/16)"
  type        = string
  default     = "10.0.0.0/16"
}

variable "cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.30"
}

# ── RDS ────────────────────────────────────────────────────────────────────
variable "db_instance_class" {
  description = "RDS instance class (e.g. db.t3.micro for dev, db.r6g.large for prod)"
  type        = string
  default     = "db.t3.micro"
}

variable "db_storage_gb" {
  description = "Allocated storage for the RDS instance in gigabytes"
  type        = number
  default     = 20
}

# ── Aurora (currently unused — see infrastructure.tf note) ─────────────────
variable "aurora_min_acu" {
  description = "Aurora Serverless v2 minimum ACU (used by modules/aurora)"
  type        = number
  default     = 0.5
}

variable "aurora_max_acu" {
  description = "Aurora Serverless v2 maximum ACU (used by modules/aurora)"
  type        = number
  default     = 4
}

# ── ElastiCache ────────────────────────────────────────────────────────────
variable "redis_node_type" {
  description = "ElastiCache node type (e.g. cache.t4g.micro for dev, cache.r6g.large for prod)"
  type        = string
  default     = "cache.t4g.micro"
}
