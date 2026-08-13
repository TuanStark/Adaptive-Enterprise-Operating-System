# ── EKS Cluster ──────────────────────────────────────────────────────────────
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.name
  cluster_version = var.cluster_version

  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids

  # Both private and public access enabled; restrict public CIDRs for prod
  cluster_endpoint_private_access      = true
  cluster_endpoint_public_access       = var.enable_public_endpoint
  cluster_endpoint_public_access_cidrs = var.public_access_cidrs

  cluster_enabled_log_types = var.cluster_enabled_log_types

  cluster_addons = {
    coredns    = { most_recent = true }
    kube-proxy = { most_recent = true }
    vpc-cni = {
      most_recent          = true
      configuration_values = jsonencode({ enableNetworkPolicy = "true" })
    }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.ebs_csi_irsa.iam_role_arn
    }
  }

  # Node groups defined as a map to support multiple groups without code changes
  eks_managed_node_groups = {
    for name, cfg in var.node_groups : name => {
      instance_types = cfg.instance_types
      capacity_type  = cfg.capacity_type
      min_size       = cfg.min_size
      max_size       = cfg.max_size
      desired_size   = cfg.desired_size

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = cfg.disk_size_gb
            volume_type           = "gp3"
            encrypted             = true
            kms_key_id            = var.kms_key_arn
            delete_on_termination = true
          }
        }
      }

      labels = cfg.labels
      taints = { for t in cfg.taints : t.key => t }
    }
  }

  enable_cluster_creator_admin_permissions = true

  tags = var.tags
}

# ── EBS CSI IRSA ─────────────────────────────────────────────────────────────
# Bundled here because it's always required alongside the cluster addons
module "ebs_csi_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name             = "${var.name}-ebs-csi"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }

  tags = var.tags
}

data "aws_region" "current" {}
