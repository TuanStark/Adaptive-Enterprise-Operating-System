include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//05-app-config"
}

dependency "compute" {
  config_path = "../04-compute"
  mock_outputs_merge_strategy_with_state = "shallow"
  mock_outputs = {
    cluster_oidc_provider_arn = "arn:aws:iam::123456789012:oidc-provider/oidc.eks.ap-southeast-1.amazonaws.com/id/mock"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

dependency "data" {
  config_path = "../03-data"
  mock_outputs_merge_strategy_with_state = "shallow"
  mock_outputs = {
    uploads_bucket_arn = "arn:aws:s3:::aeos-uploads-staging-mock"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

inputs = {
  cluster_oidc_provider_arn = dependency.compute.outputs.cluster_oidc_provider_arn
  uploads_bucket_arn        = dependency.data.outputs.uploads_bucket_arn
  ses_from_address          = "noreply@aeos.com"
}
