include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//02-security"
}

inputs = {
  # Dev: allow easy teardown (force_destroy), shorter retention
  cloudtrail_s3_force_destroy = true
  cloudtrail_retention_days   = 30
  is_multi_region_trail       = false

  # Dev: less frequent findings are fine
  guardduty_finding_frequency = "ONE_HOUR"
}
