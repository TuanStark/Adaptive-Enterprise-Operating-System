variable "name" {
  description = "Name for the IAM role (must be unique within the AWS account)"
  type        = string
}

variable "oidc_provider_arn" {
  description = "ARN of the EKS cluster OIDC provider (from eks module output)"
  type        = string
}

variable "namespace_service_accounts" {
  description = <<-EOT
    List of 'namespace:serviceaccount' pairs permitted to assume this role.
    Example: ["kube-system:aws-load-balancer-controller"]
  EOT
  type        = list(string)
}

variable "policy_arns" {
  description = "Map of IAM managed policy ARNs to attach to the role (key = logical name, value = ARN)"
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Map of tags to apply to the IAM role"
  type        = map(string)
  default     = {}
}
