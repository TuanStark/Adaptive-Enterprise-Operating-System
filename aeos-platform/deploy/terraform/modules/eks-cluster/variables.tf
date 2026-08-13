variable "name" {
  description = "Name for the EKS cluster and all associated resources"
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version for the EKS cluster (e.g. '1.30')"
  type        = string
  default     = "1.30"
}

variable "vpc_id" {
  description = "VPC ID where the EKS cluster will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of PRIVATE subnet IDs for EKS worker nodes (do not use public subnets)"
  type        = list(string)
}

variable "kms_key_arn" {
  description = "ARN of the KMS key used to encrypt EBS volumes on worker nodes"
  type        = string
}

variable "enable_public_endpoint" {
  description = "Expose the EKS API server endpoint publicly. Restrict with public_access_cidrs in production."
  type        = bool
  default     = true
}

variable "public_access_cidrs" {
  description = <<-EOT
    CIDR blocks allowed to reach the public EKS API endpoint.
    Use specific IPs (e.g. VPN/office CIDRs) in production.
    Default allows all — acceptable for dev only.
  EOT
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "node_groups" {
  description = <<-EOT
    Map of EKS managed node group configurations. Key = node group name.
    Each group supports: instance_types, min/max/desired_size, disk_size_gb,
    labels, taints, and capacity_type (ON_DEMAND | SPOT).
  EOT
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
  default = {
    system = {
      instance_types = ["t3.medium"]
      min_size       = 2
      max_size       = 4
      desired_size   = 2
      labels         = { workload = "system" }
    }
  }
}

variable "cluster_enabled_log_types" {
  description = "EKS control plane log types to stream to CloudWatch"
  type        = list(string)
  default     = ["audit", "api", "authenticator"]
}

variable "tags" {
  description = "Map of tags to apply to all resources in this module"
  type        = map(string)
  default     = {}
}
