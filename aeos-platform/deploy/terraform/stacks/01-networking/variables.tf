variable "project" {
  description = "Project name used as a prefix on all resource names"
  type        = string
  default     = "aeos"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "azs" {
  description = "List of AWS Availability Zones to deploy subnets into"
  type        = list(string)
}

variable "subnet_cidrs" {
  description = "CIDR blocks per subnet tier — one entry per AZ required"
  type = object({
    public   = list(string)
    private  = list(string)
    database = list(string)
  })
}

variable "single_nat_gateway" {
  description = "Use one shared NAT Gateway (cost saving for non-prod). Set false for HA in prod."
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Enable VPC Flow Logs"
  type        = bool
  default     = true
}

variable "flow_log_retention_days" {
  description = "Days to retain VPC Flow Logs in CloudWatch"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
