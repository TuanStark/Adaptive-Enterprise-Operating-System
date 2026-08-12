resource "aws_rds_cluster" "this" {
  cluster_identifier = var.name
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  engine_version     = var.engine_version

  database_name          = "aeos"
  master_username        = "aeos"
  manage_master_user_password = true

  storage_encrypted = true
  kms_key_id        = var.kms_key_arn

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]

  serverlessv2_scaling_configuration {
    min_capacity = var.min_acu
    max_capacity = var.max_acu
  }

  backup_retention_period      = 7
  preferred_backup_window      = "03:00-04:00"
  preferred_maintenance_window = "mon:04:00-mon:05:00"

  deletion_protection   = false
  skip_final_snapshot   = true
  apply_immediately     = true
  copy_tags_to_snapshot = true

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = var.tags
}

resource "aws_rds_cluster_instance" "writer" {
  identifier           = "${var.name}-writer"
  cluster_identifier   = aws_rds_cluster.this.id
  instance_class       = "db.serverless"
  engine               = aws_rds_cluster.this.engine
  engine_version       = aws_rds_cluster.this.engine_version
  publicly_accessible  = false

  performance_insights_enabled    = true
  performance_insights_kms_key_id = var.kms_key_arn

  tags = var.tags
}

resource "aws_rds_cluster_instance" "reader" {
  identifier           = "${var.name}-reader"
  cluster_identifier   = aws_rds_cluster.this.id
  instance_class       = "db.serverless"
  engine               = aws_rds_cluster.this.engine
  engine_version       = aws_rds_cluster.this.engine_version
  publicly_accessible  = false

  performance_insights_enabled    = true
  performance_insights_kms_key_id = var.kms_key_arn

  tags = var.tags
}

resource "aws_db_subnet_group" "this" {
  name       = var.name
  subnet_ids = var.subnet_ids
  tags       = var.tags
}

resource "aws_security_group" "this" {
  name_prefix = "${var.name}-aurora-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
    description     = "PostgreSQL from EKS"
  }

  tags = var.tags
}
