resource "aws_security_group" "backend" {
  name        = "${local.name_prefix}-backend"
  description = "Public HTTP and HTTPS through Caddy; administration uses SSM, not SSH."
  vpc_id      = aws_vpc.main.id

  ingress {
    # Caddy는 80번 포트로 인증서 검증을 처리하고 모든 일반 요청을 HTTPS로 전환합니다.
    description = "HTTP for ACME validation and HTTPS redirect"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.http_allowed_cidr]
  }

  ingress {
    # Spring Boot 포트는 공개하지 않고 TLS가 적용된 Caddy의 443번 포트만 외부에 엽니다.
    description = "Backend HTTPS"
    from_port   = 443
    to_port     = 443
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
