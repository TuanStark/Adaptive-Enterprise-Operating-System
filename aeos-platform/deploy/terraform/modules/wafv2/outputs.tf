output "web_acl_arn" {
  description = "ARN of the WAFv2 Web ACL — use this to associate with an ALB or API Gateway"
  value       = aws_wafv2_web_acl.this.arn
}

output "web_acl_id" {
  description = "ID of the WAFv2 Web ACL"
  value       = aws_wafv2_web_acl.this.id
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch Log Group receiving WAF logs (must start with 'aws-waf-logs-')"
  value       = aws_cloudwatch_log_group.waf.name
}
