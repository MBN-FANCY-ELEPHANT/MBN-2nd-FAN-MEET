variable "aws_region" {
  description = "AWS region for all Backend resources."
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "Short name used in AWS resource names and tags."
  type        = string
  default     = "trot-fandom"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "prod"
}

variable "github_repository" {
  description = "GitHub repository in owner/name form for OIDC trust."
  type        = string
}

variable "github_environment" {
  description = "GitHub Environment whose deployment jobs may assume the AWS deploy role."
  type        = string
  default     = "production"
}

variable "github_oidc_repository_subject" {
  description = "Repository segment used in the GitHub OIDC subject. Set the immutable owner/repository IDs when the organization customizes subject claims."
  type        = string
  default     = ""
}

variable "instance_type" {
  description = "EC2 size. t3.micro is sufficient for the MVP when traffic is light."
  type        = string
  default     = "t3.micro"
}

variable "root_volume_size" {
  description = "Encrypted gp3 root disk size in GiB; it also stores the PostgreSQL Docker volume."
  type        = number
  default     = 20

  validation {
    condition     = var.root_volume_size >= 16
    error_message = "root_volume_size must be at least 16 GiB."
  }
}

variable "http_allowed_cidr" {
  description = "CIDR allowed to call the public Backend HTTP endpoint."
  type        = string
  default     = "0.0.0.0/0"
}

variable "backend_domain" {
  description = "Public DNS name used by Caddy to issue and renew the Backend HTTPS certificate."
  type        = string
}

variable "create_github_oidc_provider" {
  description = "Create the account-wide GitHub OIDC provider. Set false when one already exists."
  type        = bool
  default     = true
}

variable "github_oidc_provider_arn" {
  description = "Existing GitHub OIDC provider ARN when create_github_oidc_provider is false."
  type        = string
  default     = ""

  validation {
    condition     = var.create_github_oidc_provider || length(var.github_oidc_provider_arn) > 0
    error_message = "github_oidc_provider_arn is required when provider creation is disabled."
  }
}
