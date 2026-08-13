resource "aws_rds_cluster" "this" {
  cluster_identifier = var.name
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  engine_version     = var.engine_version

  database_name               = var.database_name
  master_username             = var.master_username
  manage_master_user_password = true # Stores credentials in Secrets Manager automatically

  storage_encrypted = true
  kms_key_id        = var.kms_key_arn

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]

  serverlessv2_scaling_configuration {
    min_capacity = var.min_acu
    max_capacity = var.max_acu
  }

  backup_retention_period      = var.backup_retention_period
  preferred_backup_window      = var.preferred_backup_window
  preferred_maintenance_window = var.preferred_maintenance_window

  deletion_protection   = var.deletion_protection
  skip_final_snapshot   = var.skip_final_snapshot
  apply_immediately     = var.apply_immediately
  copy_tags_to_snapshot = true

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = var.tags

  lifecycle {
    # Engine version is managed via AWS maintenance, not Terraform diffs
    ignore_changes = [engine_version]
  }
}

# Writer instance — always provisioned
resource "aws_rds_cluster_instance" "writer" {
  identifier          = "${var.name}-writer"
  cluster_identifier  = aws_rds_cluster.this.id
  instance_class      = "db.serverless"
  engine              = aws_rds_cluster.this.engine
  engine_version      = aws_rds_cluster.this.engine_version
  publicly_accessible = false

  performance_insights_enabled    = true
  performance_insights_kms_key_id = var.kms_key_arn

  tags = var.tags
}

# Reader instance — separate endpoint for read scaling
resource "aws_rds_cluster_instance" "reader" {
  identifier          = "${var.name}-reader"
  cluster_identifier  = aws_rds_cluster.this.id
  instance_class      = "db.serverless"
  engine              = aws_rds_cluster.this.engine
  engine_version      = aws_rds_cluster.this.engine_version
  publicly_accessible = false

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
  description = "Aurora PostgreSQL cluster — ${var.name}"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
    description     = "PostgreSQL from allowed security groups"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = var.tags

  lifecycle {
    create_before_destroy = true
  }
}
