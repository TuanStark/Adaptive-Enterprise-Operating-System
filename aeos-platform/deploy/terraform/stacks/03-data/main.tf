# ── Aurora PostgreSQL (Serverless v2) ─────────────────────────────────────────
# Replaces the former modules/rds usage. Aurora Serverless v2 provides:
#   - Auto-scaling (0.5–128 ACU) — no instance resizing needed
#   - Separate read endpoint for read-scaling
#   - Credentials stored automatically in Secrets Manager
module "aurora" {
  source = "../../modules/aurora"

  name            = "${var.project}-${var.environment}"
  vpc_id          = var.vpc_id
  subnet_ids      = var.database_subnet_ids
  kms_key_arn     = var.kms_key_arn

  database_name              = var.aurora_database_name
  master_username            = var.aurora_master_username
  allowed_security_group_ids = var.eks_node_security_group_ids

  min_acu = var.aurora_min_acu
  max_acu = var.aurora_max_acu

  backup_retention_period = var.aurora_backup_retention_period
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = var.skip_final_snapshot

  tags = var.tags
}

# ── ElastiCache Redis ────────────────────────────────────────────────────────
module "redis" {
  source = "../../modules/elasticache"

  name       = "${var.project}-${var.environment}"
  vpc_id     = var.vpc_id
  subnet_ids = var.database_subnet_ids

  node_type                  = var.redis_node_type
  num_cache_clusters         = var.redis_num_clusters
  automatic_failover_enabled = var.redis_failover_enabled

  allowed_security_group_ids = var.eks_node_security_group_ids
  kms_key_arn                = var.kms_key_arn

  tags = var.tags
}

# ── S3 Uploads Bucket ─────────────────────────────────────────────────────────
# Account ID suffix ensures globally unique bucket names across environments
module "uploads_bucket" {
  source = "../../modules/s3-encrypted"

  bucket_name       = "aeos-uploads-${var.environment}-${var.account_id}"
  kms_key_arn       = var.kms_key_arn
  enable_versioning = true
  force_destroy     = var.s3_force_destroy

  lifecycle_rules = [
    {
      id                                 = "expire-noncurrent-versions"
      enabled                            = true
      noncurrent_version_expiration_days = 90
    }
  ]

  tags = var.tags
}
