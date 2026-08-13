output "state_bucket_name" {
  description = "S3 bucket name for Terraform state — put this in your remote_state config"
  value       = aws_s3_bucket.terraform_state.id
}

output "state_bucket_arn" {
  description = "ARN of the Terraform state S3 bucket"
  value       = aws_s3_bucket.terraform_state.arn
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for Terraform state locking — put this in your remote_state config"
  value       = aws_dynamodb_table.terraform_locks.id
}
