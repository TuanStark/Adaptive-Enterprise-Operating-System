# Thin wrapper around the community iam-role-for-service-accounts-eks module.
# By creating this internal module, we standardise IRSA creation across the project
# and can add project-wide conventions (naming prefix, required tags) in one place.

module "irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = var.name

  oidc_providers = {
    main = {
      provider_arn               = var.oidc_provider_arn
      namespace_service_accounts = var.namespace_service_accounts
    }
  }

  role_policy_arns = var.policy_arns

  tags = var.tags
}
