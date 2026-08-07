resource "aws_security_group" "backend" {
  name        = "${local.name_prefix}-backend"
  description = "Public HTTP for the Spring Boot Backend; administration uses SSM, not SSH."
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Backend HTTP"
    from_port   = local.public_backend_port
    to_port     = local.public_backend_port
    protocol    = "tcp"
    cidr_blocks = [var.http_allowed_cidr]
  }

  egress {
    description = "Package, ECR, SSM and OpenAI access"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name_prefix}-backend" }
}
