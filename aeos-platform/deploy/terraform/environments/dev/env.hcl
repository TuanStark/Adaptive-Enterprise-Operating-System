# env.hcl — dev environment locals
# Consumed by the root terragrunt.hcl via:
#   read_terragrunt_config(find_in_parent_folders("env.hcl"))
locals {
  environment = "dev"
  region      = "ap-southeast-1"

  # Replace with your actual AWS account ID.
  # Alternatively use: get_aws_account_id() — requires AWS CLI auth at plan time.
  account_id = "123456789012"
}
