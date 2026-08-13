config {
  module = true
  force  = false
}

plugin "aws" {
  enabled = true
  version = "0.32.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

# ── Variable Conventions ──────────────────────────────────────────────────────
rule "terraform_required_version" {
  enabled = true
}

rule "terraform_required_providers" {
  enabled = true
}

rule "terraform_naming_convention" {
  enabled = true

  variable {
    format = "snake_case"
  }

  resource {
    format = "snake_case"
  }

  data {
    format = "snake_case"
  }

  output {
    format = "snake_case"
  }
}

# ── Documentation ─────────────────────────────────────────────────────────────
rule "terraform_documented_variables" {
  enabled = true
}

rule "terraform_documented_outputs" {
  enabled = true
}

# ── Deprecated Resource Prevention ────────────────────────────────────────────
rule "aws_instance_invalid_type" {
  enabled = true
}

rule "aws_db_instance_invalid_type" {
  enabled = true
}

rule "aws_elasticache_cluster_invalid_type" {
  enabled = true
}
