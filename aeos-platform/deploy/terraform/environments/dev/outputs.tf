output "vpc_id" {
  value = module.vpc.vpc_id
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "s3_bucket" {
  value = aws_s3_bucket.uploads.id
}

output "api_irsa_role_arn" {
  value = module.aeos_api_irsa.iam_role_arn
}

output "kubeconfig_command" {
  value = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.region}"
}
