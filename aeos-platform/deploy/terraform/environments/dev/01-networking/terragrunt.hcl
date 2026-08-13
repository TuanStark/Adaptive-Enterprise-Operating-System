include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//01-networking"
}

inputs = {
  vpc_cidr = "10.0.0.0/16"
  azs      = ["ap-southeast-1a", "ap-southeast-1b"]

  subnet_cidrs = {
    public   = ["10.0.1.0/24", "10.0.2.0/24"]
    private  = ["10.0.10.0/24", "10.0.20.0/24"]
    database = ["10.0.100.0/24", "10.0.200.0/24"]
  }

  # Dev: single NAT Gateway saves ~$32/month per extra AZ
  single_nat_gateway = true

  # Dev: enable flow logs but retain for only 7 days to reduce cost
  enable_flow_logs        = true
  flow_log_retention_days = 7
}
