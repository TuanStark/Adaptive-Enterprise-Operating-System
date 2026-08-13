output "api_irsa_role_arn" {
  description = "ARN of the IRSA role for aeos-api — annotate the K8s ServiceAccount with this value"
  value       = module.api_irsa.iam_role_arn
}

output "api_irsa_role_name" {
  description = "Name of the IRSA role for aeos-api"
  value       = module.api_irsa.iam_role_name
}
