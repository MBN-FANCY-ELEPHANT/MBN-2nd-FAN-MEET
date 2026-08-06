# MBN AI 트롯 팬덤 플랫폼

MBN AI 해커톤 출품작 — 트롯 스타의 공식 콘텐츠·일정, 팬 커뮤니티, AI 팬 매니저를 하나로 묶은
**글로벌 트롯 팬덤 플랫폼**.

## 빠른 시작

사전 요구사항: Node 22+, JDK 17

```bash
# 1) 백엔드 — http://localhost:8080
cd BE && ./gradlew bootRun

# 2) 프론트엔드 — http://localhost:5173  (다른 터미널에서)
cd FE && npm install && npm run api:types && npm run dev
```

`npm run api:types`는 `docs/api-spec.yaml`에서 TypeScript 타입을 생성합니다.
`FE/src/api/schema.d.ts`는 생성물이라 git에 포함되지 않으므로 **최초 1회 반드시 실행**해야 합니다.

동작 확인:

```bash
curl http://localhost:8080/api/v1/stars/1
# {"id":1,"name":"임영웅", ... ,"greeting":"오늘 하루도 즐거운 하루되세요!", ...}
```

H2 콘솔: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:trot`, user `sa`, 비밀번호 없음)

## 구조

| 경로 | 내용 |
|---|---|
| `FE/` | React 19 + TypeScript 6 + Vite 8 (모바일 퍼스트) |
| `BE/` | Spring Boot 4.1 + Java 17 + JPA (H2 로컬 / PostgreSQL 운영) |
| `docs/` | 기획·계약 문서 — **단일 진실 공급원** |
| `기획문서/` | 원본 기획안 (참조 전용) |
| `(초안) 와이어프레임 및 UI 기초/` | 원본 와이어프레임 3종 |

## 문서

| 파일 | 내용 |
|---|---|
| [**`docs/HANDOFF.md`**](docs/HANDOFF.md) | **작업 재개 지점 — 새 환경에서 시작한다면 여기부터** |
| [`docs/design-spec.md`](docs/design-spec.md) | 화면 13개의 기능 명세 (Figma 확정본) |
| [`docs/component-map.md`](docs/component-map.md) | 컴포넌트 ↔ Figma 노드 ID 매핑 |
| [`docs/ai-stack.md`](docs/ai-stack.md) | AI 4종의 모델 선정과 파이프라인 |
| [`docs/api-spec.yaml`](docs/api-spec.yaml) | OpenAPI 3.1 API 계약. FE/BE 모두 이것을 따릅니다 |
| [`docs/design-tokens.md`](docs/design-tokens.md) | Figma 실측 디자인 토큰 |
| [`docs/domain-model.md`](docs/domain-model.md) | 엔티티 정의와 공통 규약 |
| [`docs/mvp-scope.md`](docs/mvp-scope.md) | 우선순위와 데모 골든 패스 |
| [`docs/worklog-be.md`](docs/worklog-be.md) | 백엔드 구현 현황과 다음 작업 |
| [`docs/worklog-fe.md`](docs/worklog-fe.md) | 프론트엔드 구현 현황과 다음 작업 |
| [`CLAUDE.md`](CLAUDE.md) | Claude Code 작업 규칙 |

## 환경변수

| 변수 | 위치 | 용도 |
|---|---|---|
| `OPENAI_API_KEY` | BE | AI 도우미 "비엔이" · 기사/영상 분석 · 댓글 번역 · TTS |
| `AI_PROVIDER` | BE | `stub`(기본) 또는 `openai` |
| `AUTH_SECRET` | BE | 간이 인증 토큰 서명 키. 운영 환경 필수 |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | BE | `prod` 프로파일 |
| `VITE_API_BASE_URL` | FE | 프로덕션 빌드에서 백엔드 오리진 |

## 구현 현황

- ✅ 프로젝트 구조, CI
- ✅ **디자인 확정본 분석**: 화면 13개 + 컴포넌트 16종 → 계약·토큰·명세 문서화 완료
- ✅ **BE 전 도메인**: 콘텐츠(기사·영상) · 댓글(국가 배지+번역) · 좋아요 · 구독 ·
  AI 분석(사전 생성) · AI 도우미 "비엔이"(근거+SSE) · 간이 인증 · 장소 · 팁 · 모임
- ✅ **동시성**: 다중 사용자 정원 경합 검증 완료 (정원 초과 없음)
- ✅ **FE 기반**: Figma 실측 토큰(375px) · 7개 언어 · 공통 셸 · 음성 AI 4단계 오버레이
- ⬜ **남은 P0**: FE 화면 본문 (3탭 + 상세 6종은 아직 자리표시자)
- ⬜ P1: 통합 검색, TTS, OpenAI 실연결 (현재 스텁 provider 로 동작)

진행 상태와 다음 작업은 [`docs/HANDOFF.md`](docs/HANDOFF.md), 범위 정의는
[`docs/mvp-scope.md`](docs/mvp-scope.md) 참조.
