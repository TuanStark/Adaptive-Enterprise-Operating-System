output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "API server endpoint of the EKS cluster"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "rds_endpoint" {
  description = "Connection endpoint for the RDS PostgreSQL instance"
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Primary endpoint address of the ElastiCache Redis cluster"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive   = true
}

output "s3_bucket" {
  description = "Name of the S3 uploads bucket"
  value       = aws_s3_bucket.uploads.id
}

output "api_irsa_role_arn" {
  description = "ARN of the IAM role used by the aeos-api Kubernetes service account (IRSA)"
  value       = module.aeos_api_irsa.iam_role_arn
}

output "kubeconfig_command" {
  description = "AWS CLI command to configure kubectl for this EKS cluster"
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.region}"
}
