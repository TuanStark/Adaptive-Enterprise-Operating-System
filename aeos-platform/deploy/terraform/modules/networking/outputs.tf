output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "public_subnets" {
  description = "List of public subnet IDs (one per AZ)"
  value       = module.vpc.public_subnets
}

output "private_subnets" {
  description = "List of private subnet IDs (one per AZ) — used for EKS worker nodes"
  value       = module.vpc.private_subnets
}

output "database_subnets" {
  description = "List of database subnet IDs (one per AZ) — used for RDS, Aurora, ElastiCache"
  value       = module.vpc.database_subnets
}

output "database_subnet_group_name" {
  description = "Name of the RDS/Aurora DB subnet group"
  value       = module.vpc.database_subnet_group_name
}

output "nat_public_ips" {
  description = "Public Elastic IP addresses of the NAT Gateways"
  value       = module.vpc.nat_public_ips
}

output "private_route_table_ids" {
  description = "IDs of the private route tables"
  value       = module.vpc.private_route_table_ids
}
