include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../stacks//02-security"
}

inputs = {
  cloudtrail_s3_force_destroy = true   # staging: allow teardown
  cloudtrail_retention_days   = 60
  is_multi_region_trail       = false
  guardduty_finding_frequency = "ONE_HOUR"
}
