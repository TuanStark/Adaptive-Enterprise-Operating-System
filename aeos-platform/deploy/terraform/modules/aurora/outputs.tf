output "cluster_endpoint" {
  value = aws_rds_cluster.this.endpoint
}

output "reader_endpoint" {
  value = aws_rds_cluster.this.reader_endpoint
}

output "cluster_master_user_secret" {
  value = aws_rds_cluster.this.master_user_secret
}

output "cluster_id" {
  value = aws_rds_cluster.this.id
}

output "security_group_id" {
  value = aws_security_group.this.id
}
