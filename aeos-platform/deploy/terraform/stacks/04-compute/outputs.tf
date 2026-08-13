output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "cluster_oidc_provider_arn" {
  description = "OIDC provider ARN — consumed by 05-app-config for IRSA role creation"
  value       = module.eks.cluster_oidc_provider_arn
}

output "cluster_oidc_issuer_url" {
  description = "OIDC issuer URL"
  value       = module.eks.cluster_oidc_issuer_url
}

output "node_security_group_id" {
  description = "EKS worker node security group ID — consumed by 03-data for DB/Redis ingress rules"
  value       = module.eks.node_security_group_id
}

output "cluster_security_group_id" {
  description = "EKS control plane security group ID"
  value       = module.eks.cluster_security_group_id
}

output "kubeconfig_command" {
  description = "Command to configure kubectl"
  value       = module.eks.kubeconfig_command
}
