output "kms_key_arn" {
  description = "ARN of the KMS key — consumed by 03-data and 04-compute stacks"
  value       = module.kms.key_arn
}

output "kms_key_id" {
  description = "ID of the KMS key"
  value       = module.kms.key_id
}

output "kms_key_alias" {
  description = "Alias of the KMS key (e.g. 'alias/aeos/dev')"
  value       = "alias/aeos/${var.environment}"
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = module.security_baseline.guardduty_detector_id
}

output "cloudtrail_arn" {
  description = "CloudTrail trail ARN"
  value       = module.security_baseline.cloudtrail_arn
}
