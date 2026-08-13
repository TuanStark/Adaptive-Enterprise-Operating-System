output "aurora_cluster_endpoint" {
  description = "Aurora writer endpoint — use for write queries"
  value       = module.aurora.cluster_endpoint
  sensitive   = true
}

output "aurora_reader_endpoint" {
  description = "Aurora reader endpoint — use for read-only queries"
  value       = module.aurora.reader_endpoint
  sensitive   = true
}

output "aurora_cluster_id" {
  description = "Aurora cluster identifier"
  value       = module.aurora.cluster_id
}

output "aurora_security_group_id" {
  description = "Aurora security group ID"
  value       = module.aurora.security_group_id
}

output "aurora_master_user_secret" {
  description = "Secrets Manager secret ARN containing Aurora master credentials"
  value       = module.aurora.cluster_master_user_secret
  sensitive   = true
}

output "redis_primary_endpoint" {
  description = "Redis primary endpoint address"
  value       = module.redis.primary_endpoint_address
  sensitive   = true
}

output "redis_reader_endpoint" {
  description = "Redis reader endpoint address"
  value       = module.redis.reader_endpoint_address
  sensitive   = true
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = module.redis.security_group_id
}

output "uploads_bucket_id" {
  description = "S3 uploads bucket name"
  value       = module.uploads_bucket.bucket_id
}

output "uploads_bucket_arn" {
  description = "S3 uploads bucket ARN — consumed by 05-app-config for IAM policies"
  value       = module.uploads_bucket.bucket_arn
}
