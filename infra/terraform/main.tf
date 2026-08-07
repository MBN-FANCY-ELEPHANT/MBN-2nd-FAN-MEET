locals {
  name_prefix        = "${var.project_name}-${var.environment}"
  ssm_parameter_path = "/${var.project_name}/${var.environment}/backend"
  backend_port       = 8080
}
