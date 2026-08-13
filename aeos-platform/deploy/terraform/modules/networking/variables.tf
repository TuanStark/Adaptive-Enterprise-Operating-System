variable "name" {
  description = "Name prefix for all networking resources"
  type        = string
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC (e.g. '10.0.0.0/16')"
  type        = string
}

variable "azs" {
  description = "List of availability zones to deploy subnets into"
  type        = list(string)
}

variable "subnet_cidrs" {
  description = "CIDR blocks for each subnet tier. Must have one entry per AZ."
  type = object({
    public   = list(string)
    private  = list(string)
    database = list(string)
  })
}

variable "single_nat_gateway" {
  description = <<-EOT
    Use a single shared NAT Gateway (cost-saving for non-prod).
    Set to false in production to deploy one NAT Gateway per AZ for high availability.
  EOT
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Enable VPC Flow Logs to CloudWatch. Can be disabled in dev to reduce cost."
  type        = bool
  default     = true
}

variable "flow_log_retention_days" {
  description = "Number of days to retain VPC Flow Log data in CloudWatch"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Map of tags to apply to all resources in this module"
  type        = map(string)
  default     = {}
}
