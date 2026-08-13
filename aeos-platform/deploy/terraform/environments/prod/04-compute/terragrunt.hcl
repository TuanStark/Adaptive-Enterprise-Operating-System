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
    private_subnets = ["subnet-mock-a", "subnet-mock-b", "subnet-mock-c"]
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

  # PROD: restrict public endpoint to known IPs (VPN/bastion)
  enable_public_endpoint = true
  public_access_cidrs    = ["YOUR_VPN_CIDR/32"]  # Replace with actual VPN CIDR(s)

  # PROD: separate node groups for system and application workloads
  # System pool: reserved for Kubernetes system components
  # App pool: application workloads with auto-scaling
  node_groups = {
    system = {
      instance_types = ["m6i.large"]
      min_size       = 3   # One per AZ for HA
      max_size       = 6
      desired_size   = 3
      labels         = { workload = "system" }
      taints = [
        {
          key    = "CriticalAddonsOnly"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]
    }
    app = {
      instance_types = ["m6i.xlarge", "m6a.xlarge"]  # Fallback to m6a for cost saving
      min_size       = 3
      max_size       = 20
      desired_size   = 6
      labels         = { workload = "app" }
      capacity_type  = "ON_DEMAND"
    }
    app_spot = {
      instance_types = ["m6i.xlarge", "m6a.xlarge", "m5.xlarge"]
      min_size       = 0
      max_size       = 10
      desired_size   = 0
      labels         = { workload = "app-spot" }
      capacity_type  = "SPOT"  # Spot instances for batch/non-critical workloads
    }
  }
}
