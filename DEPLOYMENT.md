# Backend AWS 배포 가이드

이 문서는 monorepo의 `BE/`만 AWS에 배포하는 방법을 설명합니다. `FE/`는 Docker 이미지와
Backend 배포 workflow의 build context 및 경로 필터에 포함되지 않습니다.

## 1. 배포 아키텍처

```text
GitHub main (BE 변경)
  └─ GitHub Actions
       ├─ Java 17 + Gradle test/build
       ├─ BE/Dockerfile 이미지 build
       ├─ GitHub OIDC로 AWS 임시 자격 증명 획득
       ├─ ECR에 commit SHA 이미지 push
       └─ SSM Run Command로 EC2 배포
             ├─ Caddy 컨테이너 (:80/:443, TLS 자동 발급·갱신)
             ├─ Spring Boot 컨테이너 (:8080, Docker 내부 전용)
             └─ PostgreSQL 16 컨테이너 (외부 포트 미노출, Docker volume)

Internet → api.dgu-fallfesta.site → Elastic IP → Caddy HTTPS → Spring Boot
```

해커톤/MVP 비용과 운영 복잡도를 낮추기 위해 ECS, EKS, ALB, NAT Gateway, RDS는 사용하지
않습니다. PostgreSQL은 EC2의 암호화된 root EBS에 Docker volume으로 저장합니다. 서버 장애와
DB 장애가 분리되지 않는 구조이므로 트래픽이나 데이터 중요도가 커지면 RDS와 ALB로 이전해야 합니다.

ECR은 이미지 전달, SHA 단위 이력, 최근 10개 이미지 rollback을 작은 비용으로 제공하므로 사용합니다.
SSH 22번 포트는 열지 않고 AWS Systems Manager Session Manager와 Run Command를 사용합니다.

도메인의 A 레코드는 Terraform의 `backend_public_ip` 출력값을 가리켜야 합니다. Caddy가 ACME를
통해 인증서를 자동 발급하고 갱신하므로 ALB 고정비 없이 HTTPS를 제공합니다.

## 2. Terraform 구조

```text
infra/terraform/
├─ versions.tf             Terraform/provider/S3 backend
├─ providers.tf            AWS provider와 현재 계정 조회
├─ variables.tf            입력 변수
├─ terraform.tfvars.example
├─ main.tf                 공통 이름과 포트
├─ network.tf              VPC, public subnet, IGW, route
├─ security_group.tf       HTTP 80/HTTPS 443 ingress, outbound
├─ ecr.tf                  ECR와 최근 이미지 10개 보존 정책
├─ iam.tf                  EC2/SSM/ECR/GitHub OIDC 역할
├─ ec2.tf                  Amazon Linux 2023 EC2, Elastic IP, HTTPS 설정
├─ outputs.tf              CI 설정에 필요한 출력
└─ templates/user-data.sh.tftpl
                            Docker 설치와 안전 배포/rollback 스크립트
```

Terraform state는 현재 로컬 `infra/terraform/terraform.tfstate`에만 저장합니다. 실제 애플리케이션
secret을 Terraform resource로 관리하면 평문이 state에 저장될 수 있으므로 SSM SecureString은 최초
설정 단계에서 별도로 생성합니다. 팀 공동 운영이 필요해지면 버전 관리·잠금이 가능한 S3 backend로
이전하세요.

## 3. AWS 최초 설정

### 3.1 로컬 준비

- Terraform 1.7 이상
- AWS CLI v2
- 인프라를 최초 생성할 수 있는 AWS 자격 증명
- 서울 리전 예시는 `ap-northeast-2`

### 3.2 변수 파일

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

`github_repository`와 `backend_domain`을 실제 값으로 설정합니다. Backend 도메인의 A 레코드는
`terraform output -raw backend_public_ip`을 가리켜야 합니다. AWS 계정에 GitHub OIDC
provider가 이미 있으면 `create_github_oidc_provider=false`와 기존 ARN을 지정합니다.

### 3.3 init, plan, apply

```bash
terraform fmt -recursive

terraform init

terraform validate
terraform plan
terraform apply
terraform output
```

`terraform init`이 생성한 `.terraform.lock.hcl`은 provider 버전 재현성을 위해 커밋하는 것이
권장됩니다. `.terraform/`, `terraform.tfvars`, plan, state 파일은 `.gitignore` 대상입니다.

최초 apply와 이후 인프라 변경은 같은 로컬 state 파일을 보유한 환경에서 수행합니다. state에는
인프라 식별 정보가 있으므로 별도 암호화 백업을 권장하며 절대로 Git에 commit하지 마세요.
GitHub Terraform workflow는 공유 state가 없는 동안 `fmt/init/validate`만 수행하고 apply하지 않습니다.

## 4. SSM Backend 환경변수 생성

`terraform output -raw ssm_parameter_prefix`의 경로 아래에 parameter를 만듭니다. 다음 명령의
예시 값은 반드시 교체하세요.

```bash
PREFIX=$(terraform output -raw ssm_parameter_prefix)
REGION=ap-northeast-2

aws ssm put-parameter --region "$REGION" --name "$PREFIX/DB_USERNAME" \
  --type SecureString --value "trot_app" --overwrite
aws ssm put-parameter --region "$REGION" --name "$PREFIX/DB_PASSWORD" \
  --type SecureString --value "CHANGE_TO_A_LONG_RANDOM_PASSWORD" --overwrite
aws ssm put-parameter --region "$REGION" --name "$PREFIX/AUTH_SECRET" \
  --type SecureString --value "CHANGE_TO_AT_LEAST_32_RANDOM_BYTES" --overwrite
aws ssm put-parameter --region "$REGION" --name "$PREFIX/APP_CORS_ALLOWED_ORIGINS" \
  --type String --value "https://YOUR_FRONTEND_DOMAIN" --overwrite
aws ssm put-parameter --region "$REGION" --name "$PREFIX/AI_PROVIDER" \
  --type String --value "stub" --overwrite
```

OpenAI를 사용할 때만 추가합니다.

```bash
aws ssm put-parameter --region "$REGION" --name "$PREFIX/OPENAI_API_KEY" \
  --type SecureString --value "YOUR_OPENAI_KEY" --overwrite
aws ssm put-parameter --region "$REGION" --name "$PREFIX/AI_PROVIDER" \
  --type String --value "openai" --overwrite
```

지원하는 Backend 환경변수:

| 변수 | 필수 | 설명 |
|---|---:|---|
| `SPRING_PROFILES_ACTIVE` | 자동 | 배포 스크립트가 `prod`로 고정 |
| `DB_URL` | 자동 | EC2 내부 PostgreSQL 주소 |
| `DB_NAME` | 선택 | 기본 `trot` |
| `DB_USERNAME` | 필수 | PostgreSQL 사용자 |
| `DB_PASSWORD` | 필수 | PostgreSQL 비밀번호 |
| `DB_DDL_AUTO` | 자동 | 최초 `create`, 이후 `update` |
| `DB_INIT_MODE` | 자동 | 최초 `always`, 이후 `never` |
| `AUTH_SECRET` | 필수 | 간이 인증 서명 키, 32바이트 이상 권장 |
| `APP_CORS_ALLOWED_ORIGINS` | 필수 | 실제 Frontend origin, 쉼표 구분 가능 |
| `AI_PROVIDER` | 선택 | 기본 `stub`, 또는 `openai` |
| `OPENAI_API_KEY` | 조건부 | `AI_PROVIDER=openai`일 때 필수 |
| `OPENAI_CHAT_MODEL` | 선택 | 기본 `gpt-4o-mini` |
| `OPENAI_MAX_OUTPUT_TOKENS` | 선택 | 기본 `400` |
| `OPENAI_DAILY_CALL_LIMIT` | 선택 | 기본 `800` |

DB 컨테이너가 생성된 뒤 `DB_PASSWORD` parameter만 바꾸면 기존 PostgreSQL 비밀번호가 자동으로
바뀌지 않습니다. 비밀번호 회전은 DB의 `ALTER ROLE`과 parameter 변경을 함께 수행해야 합니다.

## 5. GitHub 설정

GitHub repository의 **Settings → Environments → production**을 만들고 required reviewer를
지정합니다. Terraform apply와 Backend deploy는 이 환경 승인 뒤에만 실행됩니다.
AWS 역할의 OIDC subject도 `environment:production`으로 제한되어 이 Environment를 통과한 job만
배포 역할을 맡을 수 있습니다.

### GitHub Secrets

| 이름 | 값 |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `terraform output -raw github_deploy_role_arn` |

AWS Access Key와 Secret Key는 등록하지 않습니다. GitHub OIDC가 실행할 때마다 짧은 수명의
자격 증명을 발급합니다.

### GitHub Variables

| 이름 | 값 |
|---|---|
| `AWS_REGION` | `ap-northeast-2` |
| `ECR_REPOSITORY_NAME` | `terraform output -raw ecr_repository_name` |
| `EC2_INSTANCE_ID` | `terraform output -raw ec2_instance_id` |
| `SSM_PARAMETER_PREFIX` | `terraform output -raw ssm_parameter_prefix` |
| `BACKEND_HEALTH_URL` | `terraform output -raw backend_health_url` (`https://` 주소) |

## 6. Docker와 로컬 Backend 실행

Docker build context는 반드시 `BE/`만 사용합니다. Frontend 파일은 이미지에 포함되지 않습니다.

```bash
docker build -t trot-fandom-backend:local BE

# 일반 로컬 개발(H2)
cd BE
./gradlew bootRun
```

운영 프로파일 컨테이너를 로컬에서 검증하려면 PostgreSQL을 준비하고 `DB_URL`, `DB_USERNAME`,
`DB_PASSWORD`, `AUTH_SECRET`, `APP_CORS_ALLOWED_ORIGINS`를 `--env-file`로 주입합니다. 실제 `.env`
파일은 커밋하지 마세요.

## 7. 자동 배포 과정

`.github/workflows/backend-deploy.yml`은 다음 경로가 바뀔 때만 실행됩니다.

```yaml
paths:
  - 'BE/**'
  - '.github/workflows/backend-deploy.yml'
```

따라서 `FE/**`만 변경한 commit은 Backend build 또는 배포를 실행하지 않습니다. PR에서는
Gradle build/test와 Docker build까지만 수행하고, `main` push 또는 main에서 실행한 수동 workflow만
ECR/EC2 배포를 수행합니다.

배포 시 현재 컨테이너를 `trot-backend-previous`로 보관하고 새 SHA 이미지를 실행합니다. 5분 안에
`/actuator/health`가 `UP`이 아니면 새 컨테이너를 제거하고 이전 컨테이너를 다시 시작합니다.

## 8. 서버 접속과 운영 확인

접속 주소:

```bash
terraform output -raw backend_url
curl "$(terraform output -raw backend_health_url)"
```

SSH 대신 SSM Session Manager를 사용합니다.

```bash
aws ssm start-session --target "$(terraform output -raw ec2_instance_id)"
```

세션 안에서:

```bash
sudo docker ps
sudo docker inspect --format '{{json .State.Health}}' trot-backend
sudo docker logs --tail 200 -f trot-backend
sudo docker logs --tail 100 trot-postgres
sudo journalctl -u docker --since "30 minutes ago"
```

## 9. 실패, rollback, 복구

자동 health check 실패는 이전 컨테이너로 즉시 rollback합니다. 추가 수동 rollback이 필요하면 ECR의
기존 SHA 이미지로 SSM command를 보냅니다.

```bash
aws ssm send-command \
  --instance-ids "EC2_INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --parameters 'commands=["sudo /usr/local/bin/deploy-trot-backend ECR_URL:OLD_SHA ap-northeast-2 /trot-fandom/prod/backend"]'
```

복구 순서:

1. GitHub Actions의 SSM stdout/stderr 확인
2. Session Manager에서 `docker ps -a`, Backend/PostgreSQL 로그 확인
3. SSM parameter 누락과 이름 확인
4. 디스크 사용량 `df -h`, Docker 용량 `docker system df` 확인
5. 기존 SHA 이미지로 rollback

PostgreSQL 데이터는 `trot-postgres-data` Docker volume에 있지만 단일 EC2 root EBS에 있으므로
정기 EBS snapshot 또는 `pg_dump` 백업이 필요합니다. 인스턴스 교체 전에는 반드시 백업하세요.

## 10. terraform destroy 주의사항

```bash
terraform plan -destroy
terraform destroy
```

`destroy`는 EC2와 root EBS를 삭제하므로 PostgreSQL 데이터도 복구할 수 없게 됩니다. 먼저 EBS
snapshot 또는 `pg_dump`를 만들고, ECR에 보존해야 할 이미지가 있는지 확인하세요. Elastic IP와
state bucket의 남은 비용도 별도로 확인합니다. state bucket은 이 Terraform 구성 밖에서 bootstrap했기
때문에 `terraform destroy`로 삭제되지 않습니다.

## 11. 예상 비용

리전과 시점에 따라 달라지며 AWS Pricing Calculator로 최종 확인해야 합니다.

- EC2 `t3.micro` 시간 요금
- 암호화된 gp3 EBS 20 GiB
- public IPv4/Elastic IP 시간 요금
- ECR 이미지 저장 용량(최근 10개)
- SSM Parameter Store standard parameter와 Session Manager는 일반적으로 추가 비용이 없지만,
  advanced parameter 또는 높은 API 사용량은 과금될 수 있음
- 인터넷 데이터 전송과 OpenAI API는 사용량 기반 별도 비용

RDS, ALB, NAT Gateway를 제외해 고정비를 줄였지만, 가용성·TLS·DB 백업 자동화보다 비용을 우선한
MVP 구조입니다.
