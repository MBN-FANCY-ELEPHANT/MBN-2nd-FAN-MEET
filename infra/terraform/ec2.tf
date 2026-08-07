resource "aws_instance" "backend" {
  ami                         = data.aws_ssm_parameter.al2023_ami.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.backend.id]
  iam_instance_profile        = aws_iam_instance_profile.backend.name
  associate_public_ip_address = true
  monitoring                  = false

  user_data = templatefile("${path.module}/templates/user-data.sh.tftpl", {
    aws_region           = var.aws_region
    ecr_registry         = split("/", aws_ecr_repository.backend.repository_url)[0]
    ssm_parameter_prefix = local.ssm_parameter_path
    backend_port         = local.backend_port
    public_port          = local.public_backend_port
  })

  user_data_replace_on_change = true

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size
    encrypted             = true
    delete_on_termination = true
  }

  tags = { Name = "${local.name_prefix}-backend" }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_eip" "backend" {
  domain   = "vpc"
  instance = aws_instance.backend.id
  tags     = { Name = "${local.name_prefix}-backend" }
}
