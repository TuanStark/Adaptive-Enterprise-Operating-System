include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//03-data"
}

dependency "networking" {
  config_path = "../01-networking"
  mock_outputs_merge_strategy_with_state = "shallow"
  mock_outputs = {
    vpc_id           = "vpc-mock-00000000"
    database_subnets = ["subnet-mock-a", "subnet-mock-b", "subnet-mock-c"]
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

dependency "compute" {
  config_path = "../04-compute"
  mock_outputs_merge_strategy_with_state = "shallow"
  mock_outputs = {
    node_security_group_id = "sg-mock-00000000"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

inputs = {
  vpc_id                      = dependency.networking.outputs.vpc_id
  database_subnet_ids         = dependency.networking.outputs.database_subnets
  kms_key_arn                 = dependency.security.outputs.kms_key_arn
  eks_node_security_group_ids = [dependency.compute.outputs.node_security_group_id]

  # PROD Aurora: high ACU ceiling, long backup retention
  aurora_min_acu                 = 2
  aurora_max_acu                 = 32
  aurora_backup_retention_period = 30   # 30-day backup retention
  deletion_protection            = true  # CRITICAL: prevent accidental deletion
  skip_final_snapshot            = false # Take a final snapshot before any deletion

  # PROD Redis: dedicated instance, multi-node failover
  redis_node_type        = "cache.r6g.large"
  redis_num_clusters     = 2   # Primary + 1 replica — enables automatic failover
  redis_failover_enabled = true

  # PROD S3: never allow force destroy
  s3_force_destroy = false
}
