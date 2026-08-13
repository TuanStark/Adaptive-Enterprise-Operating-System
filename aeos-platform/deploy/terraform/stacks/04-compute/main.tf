module "eks" {
  source = "../../modules/eks-cluster"

  name            = "${var.project}-${var.environment}"
  cluster_version = var.cluster_version

  vpc_id     = var.vpc_id
  subnet_ids = var.private_subnet_ids

  kms_key_arn = var.kms_key_arn

  enable_public_endpoint = var.enable_public_endpoint
  public_access_cidrs    = var.public_access_cidrs

  node_groups = var.node_groups

  tags = var.tags
}
