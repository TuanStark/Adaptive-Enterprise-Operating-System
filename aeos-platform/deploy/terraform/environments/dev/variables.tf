variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "cluster_version" {
  description = "EKS cluster version"
  type        = string
  default     = "1.30"
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

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t4g.micro"
}
