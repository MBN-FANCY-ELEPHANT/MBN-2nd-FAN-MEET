# 백엔드 작업 로그

> `backend-dev` 서브에이전트와 백엔드 작업을 하는 세션이 **시작 시 읽고, 종료 시 갱신**하는 문서입니다.
> 전체 맥락은 `docs/HANDOFF.md` 를 먼저 보세요.

**최종 갱신:** 2026-08-07 · **전 도메인 구현 완료. OpenAI 실연결 검증 완료**

> ⚠️ **먼저 읽으세요:** `docs/design-spec.md`(무엇을 만들지) · `docs/ai-stack.md`(AI 작업 시)

---

## 1. 구현 현황

| 도메인 | 엔드포인트 | 상태 |
|---|---|---|
| Star | `GET /api/v1/stars/{starId}` | ✅ |
| Home | `GET /api/v1/stars/{starId}/home` | ✅ 응답 필드 `contents` (기사·영상 혼합) |
| Home | `GET /api/v1/stars/{starId}/play` | ✅ 성지순례+응원하기 집계 |
| Schedule | `GET /api/v1/schedules`, `/{id}` | ✅ |
| **Content** | `GET /api/v1/contents`, `/{id}`, `/{id}/related` | ✅ `Archive` 대체 완료 |
| **Reaction** | `POST·DELETE /api/v1/contents/{id}/like` | ✅ 멱등 |
| **Reaction** | `POST·DELETE /api/v1/comments/{id}/like` | ✅ 멱등 |
| **Comment** | `GET·POST /api/v1/contents/{id}/comments` | ✅ 국가 배지 포함 |
| **Comment** | `DELETE /api/v1/comments/{id}` | ✅ 소프트 삭제, 본인만 |
| **Comment** | `GET /api/v1/comments/{id}/translation` | ✅ `(commentId, locale)` 캐싱 |
| **Subscription** | `POST·DELETE /api/v1/channels/{id}/subscription` | ✅ 멱등 |
| **AiAnalysis** | `GET /api/v1/contents/{id}/ai-analysis` | ✅ 사전 생성 + DB 조회 (locale 폴백 KO) |
| **AiAnalysis** | `POST /api/v1/admin/ai-analysis/regenerate` | ✅ ADMIN 전용 |
| Gathering | `GET /api/v1/gatherings`, `/{id}` | ✅ 비로그인 조회 가능 |
| Gathering | `POST·DELETE .../applications` | ✅ 다중 사용자 경합 검증 완료 |
| **Chat** | `POST /api/v1/chat/sessions` | ✅ 비회원 허용 |
| **Chat** | `POST .../messages` (JSON + SSE) | ✅ 근거 검색·스코프 제한·딥링크 |
| Place | `GET /api/v1/places`, `/{id}` | ✅ |
| Tip | `GET /api/v1/tips`, `/{id}` | ✅ |
| Search | `GET /api/v1/search` | ✅ 카테고리별 제목 LIKE 검색 |
| **Auth** | `GET /api/v1/auth/demo-users`, `POST /login`, `GET /users/me` | ✅ 간이 인증 |

**삭제된 계약**: `/api/v1/archives*`, `/api/v1/auth/signup`, `/api/v1/chat/tts`, `/api/v1/chat/stt`
(음성 입출력은 브라우저 Web Speech API 로 처리 — 서버 경유가 없습니다)
**삭제된 의존성**: `com.anthropic:anthropic-java`, `io.jsonwebtoken:jjwt-*`

---

## 1-1. 신규 엔티티 (`docs/domain-model.md` §2 참조)

`Channel` · `Content`(구 ArchiveContent) · `ContentPlace` · `Comment` ·
`CommentTranslation` · `AiAnalysis`(+`AiAnalysisItem`) · `Subscription` · `Reaction` ·
`ChatSession` · `ChatMessage`(+`ChatCitation`) · `Place` · `Tip` · `User.country`

---

## 2. 검증 완료 내역 (2026-08-07)

`./gradlew build` → `EXIT=0` (테스트 포함). 앱 기동 후 curl 로 확인:

| 검증 항목 | 결과 |
|---|---|
| HOME 집계 | 스타 + 일정 1건 + 콘텐츠 10건(기사·영상 혼합) + 모임 4건 ✅ |
| PLAY 집계 | 성지순례 5건 + 응원하기 6건 ✅ |
| 기사 상세 | 기자·본문·`기사에 나온 그 곳`(KSPO DOME) 정상 ✅ |
| LIVE 플래그 | `live=true` + `viewerCount=82` 카드가 최상단 ✅ |
| AI 분석 (KO/EN) | 사전 생성 24건. `[[용어\|설명]]` 마크업 제거 후 항목화 ✅ |
| 댓글 국가 배지 | KR / US / JP 가 섞여서 반환 ✅ |
| 댓글 번역 캐시 | 일본어 댓글 → EN 즉시 반환 ✅ |
| 데모 계정 목록 | MEMBER 6명, 국가 분산 ✅ |
| 비로그인 쓰기 | 401 `UNAUTHORIZED` (JSON 본문 포함) ✅ |
| **위조 토큰** | **401 — HMAC 서명 검증 동작** ✅ |
| 좋아요 멱등성 | 212 → 213 → (재요청) 213 → 취소 212 ✅ |
| 구독 토글 | 412000 → 412001 → 412000 ✅ |
| 비로그인 모임 상세 | 200 + `myApplication=null` ✅ |
| 참여 신청 골든 패스 | 34/40 → 201 → 35/40, 취소 → 204 → 34/40 ✅ |
| 중복 신청 / 정원 마감 | 409 / 422 ✅ |
| **다중 사용자 정원 경합** | **슬롯 3개에 신규 지원자 4명 동시 → 201×3, 422×1, 최종 정확히 40/40** ✅ |
| 챗봇 근거 답변 | 일정·모임·장소 질의에 실제 DB 근거 + citations 3건 ✅ |
| **챗봇 스코프 제한** | **"오늘 날씨", "파이썬 코드" → `outOfScope=true` 거절** ✅ |
| SSE 스트리밍 | `delta`×6 → `citations` → `done` (스펙과 일치) ✅ |
| 한글 저장/반환 | 시드·요청 본문 모두 정상 ✅ |

**이번에 해소된 미검증 항목**: 서로 다른 사용자의 정원 경계 경합 — 인증이 생기면서 실제로
검증했고 **정원 초과가 발생하지 않음**을 확인했습니다.

### 이번에 고친 실제 결함

`GET /gatherings/{id}` 가 비로그인 시 401 을 반환했습니다. 컨트롤러가 `myApplication` 계산에
`requireUserId()` 를 쓰고 있었기 때문입니다 (`findUserId().orElse(null)` 로 교체).
서비스 계층은 이미 null 을 처리하고 있었으므로 컨트롤러만 수정했습니다.

---

## 3. AI 운영 메모

### provider 전환

```bash
# BE/.env
AI_PROVIDER=openai        # stub 이면 LLM 없이 템플릿으로 동작
OPENAI_API_KEY=sk-...
```

기동 로그에서 `provider=live` 를 확인하세요. `stub` 이면 `.env` 를 다시 보세요.

### 실연결 시 겪은 것

| 항목 | 내용 |
|---|---|
| **언어 지시는 목표 언어로** | 한국어 프롬프트에 "English 로 답하세요"라고 쓰면 **모델이 한국어로 답합니다.** `languageDirective()` 가 목표 언어로 직접 지시문을 만듭니다 |
| 워밍업 50초 | 분석 24건 생성. **백그라운드 스레드**라 앱은 즉시 뜹니다 |
| 근거 선별 | 근거 3건을 주면 질문에 맞는 것만 골라 답합니다 — 스텁 대비 가장 큰 차이 |
| 비용 | 전체 개발·검증 통틀어 $1 미만 |

### 스텁의 한계 (`AI_PROVIDER=stub` 일 때)

| 기능 | 스텁 동작 |
|---|---|
| 챗봇 답변 | 의도별 **템플릿** 문장. 사실 값은 실제 DB 근거에서 옵니다 |
| AI 분석 | 본문에서 문장을 추출해 항목화 |
| 댓글 번역 | **503.** 가짜 번역이 진짜처럼 보이는 게 더 위험합니다. 시드 댓글 8건은 미리 번역돼 있습니다 |
| 언어 | KO/EN 만. 나머지는 EN 폴백 |

---

## 4. 코드 규약 요약

상세는 `BE/CLAUDE.md`. 핵심만:

- 패키지는 **도메인별 수직 분할**. `star` 가 표준 예시
- DTO 필드명은 `api-spec.yaml` 스키마와 **1:1**. 엔티티 직접 반환 금지
- 에러는 `ErrorCode` + `ApiException`. 컨트롤러에서 try/catch 금지
- 페이징 응답은 `PageResponse.from(page, Dto::from)`
- 서비스는 클래스에 `@Transactional(readOnly = true)`, 쓰기 메서드만 `@Transactional` 덮어쓰기
- `Gathering.currentCount` 는 **반드시** `GatheringRepository.incrementIfAvailable` 로만 변경
  (조회 후 저장하면 정원 초과)
- LAZY 연관은 목록 조회 시 `@EntityGraph` 로 fetch join (N+1 방지)
- 새 엔티티 추가 시 `data.sql` 시드도 함께 추가

## 5. 빌드 · 검증

```bash
cd BE && ./gradlew build; echo EXIT=${PIPESTATUS[0]}   # EXIT=0 을 눈으로 확인할 것
cd BE && ./gradlew bootRun > /tmp/boot.log 2>&1 &      # 로그가 필요하면 파일로
```

⚠️ `| tail` 만 붙이면 gradle 실패가 가려집니다. 한글 요청 본문은 파일로 저장 후
`curl --data-binary @file` (Git Bash 가 CP949 로 보냅니다).
