resource "aws_wafv2_web_acl" "this" {
  name  = var.name
  scope = "REGIONAL"

  default_action { allow {} }

  rule {
    name     = "RateLimit"
    priority = 0
    action { block {} }
    statement {
      rate_based_statement {
        limit              = var.rate_limit
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.name}-rate-limit"
    }
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.name}-common-rules"
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.name}-bad-inputs"
    }
  }

  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 3
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesSQLiRuleSet"
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.name}-sqli"
    }
  }

  rule {
    name     = "AWSManagedRulesLinuxRuleSet"
    priority = 4
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesLinuxRuleSet"
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.name}-linux"
    }
  }

  visibility_config {
    sampled_requests_enabled   = true
    cloudwatch_metrics_enabled = true
    metric_name                = var.name
  }

  tags = var.tags
}

resource "aws_wafv2_web_acl_association" "alb" {
  count        = var.alb_arn != "" ? 1 : 0
  resource_arn = var.alb_arn
  web_acl_arn  = aws_wafv2_web_acl.this.arn
}

resource "aws_wafv2_web_acl_logging_configuration" "this" {
  log_destination_configs = [aws_cloudwatch_log_group.waf.arn]
  resource_arn            = aws_wafv2_web_acl.this.arn
}

resource "aws_cloudwatch_log_group" "waf" {
  name              = "aws-waf-logs-${var.name}"
  retention_in_days = 30
  tags              = var.tags
}

output "web_acl_arn" {
  value = aws_wafv2_web_acl.this.arn
}
