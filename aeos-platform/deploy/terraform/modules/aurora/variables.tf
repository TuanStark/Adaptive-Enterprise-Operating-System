variable "name" {
  type = string
}

variable "engine_version" {
  type    = string
  default = "16.4"
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "allowed_security_group_ids" {
  type = list(string)
}

variable "kms_key_arn" {
  type = string
}

variable "min_acu" {
  type    = number
  default = 0.5
}

variable "max_acu" {
  type    = number
  default = 4
}

variable "tags" {
  type    = map(string)
  default = {}
}
