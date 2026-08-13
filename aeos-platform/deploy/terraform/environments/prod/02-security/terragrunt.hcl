include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//02-security"
}

inputs = {
  # PROD: never allow force_destroy on audit logs
  cloudtrail_s3_force_destroy = false
  cloudtrail_retention_days   = 365  # 1 year for compliance
  is_multi_region_trail       = true  # Capture global service events across all regions

  # PROD: real-time finding frequency for rapid incident response
  guardduty_finding_frequency = "FIFTEEN_MINUTES"
}
