provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = "aeos"
      ManagedBy = "terraform"
      Stack     = "bootstrap"
    }
  }
}
