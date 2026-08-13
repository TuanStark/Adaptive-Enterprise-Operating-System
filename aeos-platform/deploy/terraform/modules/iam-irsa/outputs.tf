output "iam_role_arn" {
  description = "ARN of the IRSA IAM role — annotate the Kubernetes ServiceAccount with this value"
  value       = module.irsa.iam_role_arn
}

output "iam_role_name" {
  description = "Name of the IRSA IAM role"
  value       = module.irsa.iam_role_name
}
