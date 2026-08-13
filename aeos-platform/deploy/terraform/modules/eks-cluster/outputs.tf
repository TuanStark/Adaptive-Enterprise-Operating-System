output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "HTTPS endpoint of the Kubernetes API server"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "cluster_certificate_authority_data" {
  description = "Base64-encoded certificate authority data for the cluster"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "cluster_version" {
  description = "Kubernetes version running on the cluster"
  value       = module.eks.cluster_version
}

output "cluster_oidc_provider_arn" {
  description = "ARN of the OIDC identity provider — used to create IRSA roles"
  value       = module.eks.oidc_provider_arn
}

output "cluster_oidc_issuer_url" {
  description = "URL of the OIDC issuer (without https://)"
  value       = module.eks.cluster_oidc_issuer_url
}

output "node_security_group_id" {
  description = "ID of the security group attached to all EKS worker nodes"
  value       = module.eks.node_security_group_id
}

output "cluster_security_group_id" {
  description = "ID of the security group attached to the EKS control plane"
  value       = module.eks.cluster_security_group_id
}

output "kubeconfig_command" {
  description = "AWS CLI command to update local kubeconfig for this cluster"
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${data.aws_region.current.name}"
}
