include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//04-compute"
}

dependency "networking" {
  config_path = "../01-networking"
  mock_outputs_merge_strategy_with_state = "shallow"
  mock_outputs = {
    vpc_id          = "vpc-mock-00000000"
    private_subnets = ["subnet-mock-a", "subnet-mock-b"]
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

dependency "security" {
  config_path = "../02-security"
  mock_outputs_merge_strategy_with_state = "shallow"
  mock_outputs = {
    kms_key_arn = "arn:aws:kms:ap-southeast-1:123456789012:key/mock-key-id"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

inputs = {
  vpc_id             = dependency.networking.outputs.vpc_id
  private_subnet_ids = dependency.networking.outputs.private_subnets
  kms_key_arn        = dependency.security.outputs.kms_key_arn
  cluster_version    = "1.30"

  # Staging: public endpoint but restricted to known IP ranges
  enable_public_endpoint = true
  public_access_cidrs    = ["YOUR_VPN_CIDR/32"]  # Replace with actual VPN/office CIDR

  node_groups = {
    system = {
      instance_types = ["t3.large"]
      min_size       = 2
      max_size       = 6
      desired_size   = 3
      labels         = { workload = "system" }
    }
  }
}
