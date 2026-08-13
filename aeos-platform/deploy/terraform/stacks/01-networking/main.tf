module "networking" {
  source = "../../modules/networking"

  name        = "${var.project}-${var.environment}"
  environment = var.environment

  vpc_cidr     = var.vpc_cidr
  azs          = var.azs
  subnet_cidrs = var.subnet_cidrs

  single_nat_gateway      = var.single_nat_gateway
  enable_flow_logs        = var.enable_flow_logs
  flow_log_retention_days = var.flow_log_retention_days

  tags = var.tags
}
