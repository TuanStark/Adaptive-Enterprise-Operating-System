variable "project" {
  description = "Project name"
  type        = string
  default     = "aeos"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.30"
}

variable "vpc_id" {
  description = "VPC ID (from 01-networking stack output)"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for EKS worker nodes (from 01-networking stack output)"
  type        = list(string)
}

variable "kms_key_arn" {
  description = "KMS key ARN for EBS encryption (from 02-security stack output)"
  type        = string
}

variable "enable_public_endpoint" {
  description = "Expose the EKS API server publicly"
  type        = bool
  default     = true
}

variable "public_access_cidrs" {
  description = "CIDRs allowed to reach the public EKS API. Restrict to VPN/office IPs in prod."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "node_groups" {
  description = "Map of EKS managed node group configurations (see eks-cluster module for schema)"
  type = map(object({
    instance_types = list(string)
    min_size       = number
    max_size       = number
    desired_size   = number
    disk_size_gb   = optional(number, 50)
    labels         = optional(map(string), {})
    taints = optional(list(object({
      key    = string
      value  = string
      effect = string
    })), [])
    capacity_type = optional(string, "ON_DEMAND")
  }))
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
