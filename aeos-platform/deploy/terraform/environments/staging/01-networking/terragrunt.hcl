include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//01-networking"
}

inputs = {
  vpc_cidr = "10.1.0.0/16"  # Staging uses a separate CIDR to avoid overlap with dev VPC peering
  azs      = ["ap-southeast-1a", "ap-southeast-1b"]

  subnet_cidrs = {
    public   = ["10.1.1.0/24", "10.1.2.0/24"]
    private  = ["10.1.10.0/24", "10.1.20.0/24"]
    database = ["10.1.100.0/24", "10.1.200.0/24"]
  }

  single_nat_gateway      = true   # staging: single NAT is acceptable
  enable_flow_logs        = true
  flow_log_retention_days = 30
}
