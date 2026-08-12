locals {
  name        = "aeos-${var.environment}"
  common_tags = {
    Project     = "aeos"
    Environment = var.environment
  }
  azs = ["${var.region}a", "${var.region}b"]
}

# ── VPC ──
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = local.name
  cidr = var.vpc_cidr

  azs              = local.azs
  public_subnets   = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets  = ["10.0.10.0/24", "10.0.20.0/24"]
  database_subnets = ["10.0.100.0/24", "10.0.200.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
  enable_dns_support   = true

  create_database_subnet_group       = true
  create_database_subnet_route_table = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }

  enable_flow_log                                 = true
  flow_log_destination_type                       = "cloud-watch-logs"
  create_flow_log_cloudwatch_iam_role             = true
  create_flow_log_cloudwatch_log_group            = true
  flow_log_cloudwatch_log_group_retention_in_days = 30

  tags = local.common_tags
}

# ── EKS ──
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = local.name
  cluster_version = var.cluster_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true

  cluster_enabled_log_types = ["audit", "api", "authenticator"]

  cluster_addons = {
    coredns    = { most_recent = true }
    kube-proxy = { most_recent = true }
    vpc-cni = {
      most_recent = true
      configuration_values = jsonencode({ enableNetworkPolicy = "true" })
    }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.ebs_csi_irsa.iam_role_arn
    }
  }

  eks_managed_node_groups = {
    system = {
      instance_types = ["t3.medium"]
      min_size       = 2
      max_size       = 4
      desired_size   = 2

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size = 50
            encrypted   = true
            kms_key_id  = module.kms.key_arn
          }
        }
      }

      labels = { workload = "system" }
    }
  }

  enable_cluster_creator_admin_permissions = true

  tags = local.common_tags
}

# ── KMS ──
module "kms" {
  source  = "terraform-aws-modules/kms/aws"
  version = "~> 2.0"

  description = "AEOS ${var.environment} encryption key"
  key_usage   = "ENCRYPT_DECRYPT"

  aliases = ["aeos/${var.environment}"]

  tags = local.common_tags
}

# ── EBS CSI IRSA ──
module "ebs_csi_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name             = "${local.name}-ebs-csi"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }
}

# ── AEOS API IRSA ──
module "aeos_api_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = "${local.name}-api"

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["aeos:aeos-api"]
    }
  }

  role_policy_arns = {
    s3  = aws_iam_policy.api_s3.arn
    ses = aws_iam_policy.api_ses.arn
  }
}

resource "aws_iam_policy" "api_s3" {
  name = "${local.name}-api-s3"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"]
      Resource = ["arn:aws:s3:::aeos-uploads-${var.environment}", "arn:aws:s3:::aeos-uploads-${var.environment}/*"]
    }]
  })
}

resource "aws_iam_policy" "api_ses" {
  name = "${local.name}-api-ses"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = ["*"]
      Condition = {
        StringEquals = { "ses:FromAddress" = "noreply@aeos.com" }
      }
    }]
  })
}

# ── RDS ──
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = local.name
  engine     = "postgres"
  engine_version = "16.4"
  family     = "postgres16"
  major_engine_version = "16"

  instance_class    = var.db_instance_class
  allocated_storage = var.db_storage_gb

  db_name  = "aeos"
  username = "aeos"
  port     = 5432

  manage_master_user_password = true

  storage_encrypted = true
  kms_key_id        = module.kms.key_arn

  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  multi_az = false

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  auto_minor_version_upgrade = true
  deletion_protection        = false

  performance_insights_enabled    = true
  performance_insights_kms_key_id = module.kms.key_arn

  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  tags = local.common_tags
}

resource "aws_security_group" "rds" {
  name_prefix = "${local.name}-rds-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
    description     = "PostgreSQL from EKS nodes"
  }

  tags = local.common_tags
}

resource "aws_iam_role" "rds_monitoring" {
  name = "${local.name}-rds-monitoring"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ── ElastiCache (Redis) ──
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = local.name
  description          = "AEOS Redis ${var.environment}"

  engine         = "redis"
  engine_version = "7.1"
  node_type      = var.redis_node_type
  num_cache_clusters = 1

  port = 6379

  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                 = module.kms.key_arn

  automatic_failover_enabled = false

  snapshot_retention_limit = 3
  snapshot_window          = "05:00-06:00"
  maintenance_window       = "mon:06:00-mon:07:00"

  tags = local.common_tags
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "${local.name}-redis"
  subnet_ids = module.vpc.database_subnets
}

resource "aws_security_group" "redis" {
  name_prefix = "${local.name}-redis-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
    description     = "Redis from EKS nodes"
  }

  tags = local.common_tags
}

# ── S3 (Uploads) ──
resource "aws_s3_bucket" "uploads" {
  bucket = "aeos-uploads-${var.environment}"
  tags   = local.common_tags
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = module.kms.key_arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── Security: GuardDuty ──
resource "aws_guardduty_detector" "main" {
  enable                       = true
  finding_publishing_frequency = "FIFTEEN_MINUTES"

  tags = local.common_tags
}

resource "aws_guardduty_detector_feature" "eks_audit_logs" {
  detector_id = aws_guardduty_detector.main.id
  name        = "EKS_AUDIT_LOGS"
  status      = "ENABLED"
}

resource "aws_guardduty_detector_feature" "s3_data_events" {
  detector_id = aws_guardduty_detector.main.id
  name        = "S3_DATA_EVENTS"
  status      = "ENABLED"
}

# ── Security: CloudTrail ──
resource "aws_cloudtrail" "main" {
  name                       = local.name
  s3_bucket_name             = aws_s3_bucket.cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail      = false
  enable_log_file_validation = true
  kms_key_id                 = module.kms.key_arn

  event_selector {
    read_write_type           = "All"
    include_management_events = true
  }

  tags = local.common_tags
}

resource "aws_s3_bucket" "cloudtrail" {
  bucket        = "${local.name}-cloudtrail"
  force_destroy = true
  tags          = local.common_tags
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AWSCloudTrailAclCheck"
        Effect    = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action    = "s3:GetBucketAcl"
        Resource  = aws_s3_bucket.cloudtrail.arn
      },
      {
        Sid       = "AWSCloudTrailWrite"
        Effect    = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.cloudtrail.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
        Condition = { StringEquals = { "s3:x-amz-acl" = "bucket-owner-full-control" } }
      }
    ]
  })
}
