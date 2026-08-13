output "primary_endpoint_address" {
  description = "DNS address of the Redis primary endpoint"
  value       = aws_elasticache_replication_group.this.primary_endpoint_address
  sensitive   = true
}

output "reader_endpoint_address" {
  description = "DNS address of the Redis reader endpoint (round-robin across replicas)"
  value       = aws_elasticache_replication_group.this.reader_endpoint_address
  sensitive   = true
}

output "port" {
  description = "Redis port (always 6379)"
  value       = 6379
}

output "security_group_id" {
  description = "ID of the security group attached to the Redis cluster"
  value       = aws_security_group.this.id
}

output "replication_group_id" {
  description = "ID of the ElastiCache replication group"
  value       = aws_elasticache_replication_group.this.id
}
