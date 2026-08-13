output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = module.networking.vpc_cidr_block
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnets
}

output "private_subnets" {
  description = "Private subnet IDs (for EKS worker nodes)"
  value       = module.networking.private_subnets
}

output "database_subnets" {
  description = "Database subnet IDs (for RDS, Aurora, ElastiCache)"
  value       = module.networking.database_subnets
}

output "database_subnet_group_name" {
  description = "Name of the DB subnet group"
  value       = module.networking.database_subnet_group_name
}

output "nat_public_ips" {
  description = "Public IPs of NAT Gateways — add to security group allowlists if needed"
  value       = module.networking.nat_public_ips
}
