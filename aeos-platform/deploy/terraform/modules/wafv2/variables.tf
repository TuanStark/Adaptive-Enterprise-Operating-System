variable "name" {
  type = string
}

variable "rate_limit" {
  type    = number
  default = 2000
}

variable "alb_arn" {
  type    = string
  default = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}
