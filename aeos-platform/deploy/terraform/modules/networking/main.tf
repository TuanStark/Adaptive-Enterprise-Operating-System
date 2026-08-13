# Wraps the terraform-aws-modules/vpc community module with project-opinionated defaults.
# Key design decisions:
#   - Single NAT gateway by default (set single_nat_gateway = false for HA in prod)
#   - Kubernetes ELB tags are always applied to enable AWS Load Balancer Controller
#   - Flow logs are configurable per environment to manage cost

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = var.name
  cidr = var.vpc_cidr

  azs              = var.azs
  public_subnets   = var.subnet_cidrs.public
  private_subnets  = var.subnet_cidrs.private
  database_subnets = var.subnet_cidrs.database

  enable_nat_gateway   = true
  single_nat_gateway   = var.single_nat_gateway
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Database subnet group + route table for clean RDS/Aurora access
  create_database_subnet_group       = true
  create_database_subnet_route_table = true

  # Tags required for AWS Load Balancer Controller to discover subnets
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }

  # VPC Flow Logs (toggle per environment to save cost in dev)
  enable_flow_log                                 = var.enable_flow_logs
  flow_log_destination_type                       = "cloud-watch-logs"
  create_flow_log_cloudwatch_iam_role             = var.enable_flow_logs
  create_flow_log_cloudwatch_log_group            = var.enable_flow_logs
  flow_log_cloudwatch_log_group_retention_in_days = var.flow_log_retention_days

  tags = var.tags
}
