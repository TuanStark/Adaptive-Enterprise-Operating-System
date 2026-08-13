include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//01-networking"
}

inputs = {
  vpc_cidr = "10.2.0.0/16"  # Prod uses a separate CIDR space
  azs      = ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"]  # 3 AZs for HA

  subnet_cidrs = {
    public   = ["10.2.1.0/24", "10.2.2.0/24", "10.2.3.0/24"]
    private  = ["10.2.10.0/24", "10.2.20.0/24", "10.2.30.0/24"]
    database = ["10.2.100.0/24", "10.2.200.0/24", "10.2.210.0/24"]
  }

  # PROD: one NAT Gateway per AZ — critical for HA (losing one AZ should not affect other AZs)
  single_nat_gateway = false

  enable_flow_logs        = true
  flow_log_retention_days = 90  # Prod: 90 days for compliance
}
