output "backend_url" {
  description = "Public HTTP URL for the Backend."
  value       = "http://${aws_eip.backend.public_ip}"
}

output "backend_health_url" {
  description = "Health endpoint used by CI after deployment."
  value       = "http://${aws_eip.backend.public_ip}/actuator/health"
}

output "ec2_instance_id" {
  value = aws_instance.backend.id
}

output "ecr_repository_name" {
  value = aws_ecr_repository.backend.name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ssm_parameter_prefix" {
  description = "Create runtime SecureString parameters below this path; values are intentionally not stored in Terraform state."
  value       = local.ssm_parameter_path
}

output "github_deploy_role_arn" {
  value = aws_iam_role.github_deploy.arn
}
