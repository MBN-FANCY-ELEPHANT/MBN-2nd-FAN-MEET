# 인수인계 (HANDOFF)

> **다른 PC·다른 세션에서 이 프로젝트를 처음 여는 사람(또는 Claude Code)이 읽는 문서입니다.**
> 이 파일 + `docs/worklog-be.md` + `docs/worklog-fe.md` 세 개면 즉시 이어서 작업할 수 있습니다.
>
> **작업을 마칠 때마다 갱신하세요.** 갱신하지 않으면 다음 세션이 같은 작업을 반복하거나
> 이미 내린 결정을 다시 논의하게 됩니다.

**최종 갱신:** 2026-08-07 · 현장 마무리 직전 상태. **골든 패스 전 구간 동작 확인 완료**

---

## 1. 30초 요약

MBN AI 해커톤 출품작 — **글로벌 트롯 팬덤 플랫폼** (React 19 + Spring Boot 4 모노레포).

3탭(HOME / COMMUNITY / PLAY) + **음성 AI 도우미 "비엔이"** + 기사·영상 + **글로벌 댓글**이 핵심입니다.

**지금 상태: 데모 가능합니다.**

- ✅ **BE 전 도메인 완료** — curl 로 전부 검증 (`worklog-be.md` §2)
- ✅ **OpenAI 실연결 완료** — `gpt-4o-mini`. 근거 선별·스코프 제한·다국어 동작 확인
- ✅ **FE 14화면 완료** — Figma `get_design_context` 실측 대조 반영
- ✅ **음성 입출력 전부 무료** — 브라우저 Web Speech API (키 불필요)

**내일 할 일:** §5 참조. 남은 건 마스코트 실물 확인과 **시연 리허설**입니다.

---

## 2. 재개 절차

```bash
# 사전 요구: Node 22+, JDK 17

# 0) AI 키 (없으면 스텁 모드로 동작 — 데모는 여전히 가능합니다)
cp BE/.env.example BE/.env
#    BE/.env 에서 AI_PROVIDER=openai / OPENAI_API_KEY=sk-... 설정

# 1) 백엔드 — http://localhost:8080
cd BE && ./gradlew bootRun

# 2) 프론트엔드 — http://localhost:5173 (다른 터미널)
cd FE && npm install && npm run api:types && npm run dev
```

> ⚠️ `npm run api:types` 는 **최초 1회 반드시** 실행하세요.
> `FE/src/api/schema.d.ts` 는 생성물이라 git 에 없고, 없으면 타입체크가 실패합니다.

**환경 정상 확인 (이 3개가 통과하면 됩니다):**

```bash
curl http://localhost:8080/api/v1/stars/1/home        # 스타 + 일정 + 콘텐츠10 + 모임4
cd BE && ./gradlew build; echo EXIT=${PIPESTATUS[0]}  # EXIT=0
cd FE && npm run build;   echo EXIT=${PIPESTATUS[0]}  # EXIT=0
```

기동 로그에서 **`provider=live`** 를 확인하세요. `provider=stub` 이면 `BE/.env` 를 다시 보세요.

H2 콘솔: http://localhost:8080/h2-console (JDBC `jdbc:h2:mem:trot`, user `sa`, 비밀번호 없음)

---

## 3. 읽어야 할 문서

| 파일 | 언제 읽나 |
|---|---|
| `CLAUDE.md` (루트) | 항상. 공통 규칙과 **환경 함정** |
| **`docs/design-spec.md`** | **화면 13개의 기능 명세. 무엇을 만들지 여기서 확인** |
| **`docs/component-map.md`** | **컴포넌트 ↔ Figma 노드 ID 매핑. 화면 작업 전** |
| **`docs/ai-stack.md`** | **AI 기술 선정·비용·전환 방법. AI 작업 전** |
| `docs/api-spec.yaml` | API 를 건드리기 전 **항상**. 단일 진실 공급원 |
| `docs/design-tokens.md` | Figma 실측 토큰 (추정치 아님) |
| `docs/domain-model.md` | 엔티티/공통 규약 |
| `docs/mvp-scope.md` | 우선순위와 **하지 않기로 한 것** + 골든 패스 대본 |
| `docs/worklog-be.md` / `worklog-fe.md` | 해당 영역 작업 시 |

**Figma**: `fileKey: 71R3xxvzqYiDB6vjpfZUKR` — MCP 연결·인증 완료.
화면 작업 시 **스크린샷만 보지 말고** `component-map.md` 의 노드 ID로 `get_design_context` 를
호출하세요. 실측하니 눈으로 본 것과 6군데가 달랐습니다.

---

## 4. 전체 진행률

| 영역 | 상태 |
|---|---|
| 프로젝트 구조 · CI | ✅ 모노레포, 경로 필터 CI 2종 |
| 디자인 분석 · 문서화 | ✅ 13화면 + 컴포넌트 16종 |
| API 계약 | ✅ 타입 생성 검증 통과 |
| **BE — 전 도메인** | ✅ Content · Comment · Reaction · Subscription · AiAnalysis · Chat · Auth · Place · Tip · Search |
| **BE — 동시성** | ✅ 다중 사용자 정원 경합 검증 (정원 초과 없음) |
| **AI — OpenAI 실연결** | ✅ `provider=live` 검증 완료 |
| **FE — 토큰 · i18n(7종) · 셸** | ✅ Figma 실측값, 375px, 아이콘 10종 |
| **FE — 음성 AI 4단계** | ✅ 마스코트 3포즈 적용 |
| **FE — 화면 14종** | ✅ 3탭 + 상세 4 + 댓글 + 목록·검색 6 |
| 마스코트 실물 확인 | ⏳ 코드 적용은 끝. 눈으로 볼 일만 남음 |
| 시연 리허설 | ❌ **내일 최우선** |

---

## 5. 내일 할 일 (우선순위 순)

### ① 시연 리허설 ★최우선

`docs/mvp-scope.md` §1 골든 패스 6단계를 **처음부터 끝까지 3회** 돌려보세요.
지금 상태로 전 구간이 동작합니다. 이제 **끊기는 지점을 찾는 것**이 남은 일입니다.

**리허설 전 체크리스트**

- [ ] **Chrome / Edge** 로 열 것 (Firefox 는 음성 인식 미지원 → 텍스트 폴백으로 넘어감)
- [ ] **마이크 권한 미리 허용** — 심사 중 권한 팝업이 뜨면 흐름이 끊깁니다
- [ ] 권한을 **거부했을 때** 텍스트 입력으로 넘어가는지 한 번 확인
- [ ] **시드 날짜 확인** — 오늘이 2026-08-09 를 넘기면 "다가오는 일정"이 비어 보입니다
      → `BE/src/main/resources/data.sql` 의 schedule 날짜를 미루세요
- [ ] 기동 후 **50초** 기다렸다가 기사 상세 열기 (AI 분석 워밍업이 백그라운드로 돕니다)

### ② 마스코트 실물 확인

COMMUNITY 배너 우측 마스코트, 음성 오버레이 마스코트가 의도대로 보이는지.
DIM 이 `rgba(17,24,39,0.85)` 로 꽤 어둡습니다 — 과하면 `tokens.css` 한 줄로 조정됩니다.

### ③ 여유가 있으면

- 실제 썸네일 이미지 (지금은 `example_thumb.png` 하나를 전 카드에서 재사용)
- 모임 상세 CTA 를 디자인대로 흐름 배치로 되돌릴지 결정 (§7 참조)

---

## 6. ⚠️ 알려진 제약

| 항목 | 내용 |
|---|---|
| **AI 기본값은 stub** | `BE/.env` 에 `AI_PROVIDER=openai` 가 없으면 템플릿 응답입니다. 기동 로그의 `provider=live` 확인 |
| **워밍업 50초** | 실연결 시 분석 24건 생성. **백그라운드라 앱은 즉시 뜨고**, 그 사이 상세 화면은 "AI 분석 준비 중"을 보여줍니다 |
| **Firefox 음성 미지원** | 텍스트 입력으로 자동 전환됩니다. 데모는 Chrome/Edge 로 |
| **비검수 번역 5종** | fr/ja/es/zh/ru 는 AI 생성 결과 그대로 (의도된 결정) |
| **썸네일 1종 재사용** | 모든 카드가 `example_thumb.png` 를 씁니다 |
| **유료 TTS 없음** | 브라우저 `speechSynthesis`. 음질이 아쉬우면 `OpenAiClient` 하단 주석 참조 |

### 해소된 항목 (되돌아갈 필요 없음)

- ~~`CurrentUserProvider` 데모 계정 하드코딩~~ → 간이 인증(HMAC 서명 토큰)으로 대체
- ~~`SecurityConfig` permitAll 우회~~ → 제거됨
- ~~다중 사용자 정원 경합 미검증~~ → **검증 완료**. 슬롯 3개에 신규 지원자 4명 동시 신청 →
  201×3, 422×1, 최종 정확히 40/40
- ~~`anthropic-java` · `jjwt` 의존성~~ → 제거됨
- ~~`tokens.css` 추정값~~ → Figma 실측값

---

## 7. 결정 로그 (다시 논의하지 말 것)

| 결정 | 이유 |
|---|---|
| 모노레포 (`FE/`, `BE/` 형제) | 한 세션에서 계약 불일치를 즉시 발견 |
| 계약 우선 (OpenAPI → 타입 생성) | FE/BE 병렬 작업 시 충돌 제거 |
| 실시간 채팅 **컷** | "실시간 소통" 서사는 AI 도우미가 담당 |
| 결제 **컷** | 법적·보안 리스크. 모임 비용은 표시 전용 |
| 다중 스타 **컷** (스키마만 준비) | MVP 는 임영웅 1명 |
| 영상 자체 호스팅 **컷** | 저작권. YouTube 임베드 |
| 데스크톱 레이아웃 **컷** | 디자인이 375px 모바일 단일 |
| AI 는 스타를 사칭하지 않음 | 기획서 5-2 필수 정책. 심사에서 오히려 강점 |
| 장소는 공개 출처만, `sourceUrl` 필수 | 사생활 보호 |
| **`Archive` → `Content` 재정의** | HOME 캐러셀이 기사·영상을 한 목록에 섞음 |
| **AI 진입점은 마이크 FAB 단독** | 검색바 AI 모드가 디자인에서 삭제됨 |
| **텍스트 LLM 만 OpenAI, 음성은 브라우저** | STT/TTS 는 무료 브라우저 API 로 충분. 음성 비용 $0 |
| **STT 는 Web Speech API** | "말하는 중" 실시간 표시는 interim result 없이 불가 |
| **AI 분석은 사전 생성 + DB 캐싱** | 매 요청 호출 시 3~8초 대기. 데모 안정성이 압도적 |
| **AI 키는 `BE/.env` 로만** | FE 직접 호출 시 개발자도구에서 그대로 노출 |
| 언어 7개, 검수는 ko/en 만 | UI 문자열 비용이 낮고 "글로벌" 인상이 가장 강함 |
| **인증은 간이 데모 로그인** | 로그인/로그아웃 구분 + 아바타·국가 배지만 필요 |
| LIVE 는 **정적 플래그** | 실제 방송 소스 없음. 배지 표시까지만 |
| COMMUNITY 게시판 **없음** | 디자인에 화면이 없음 |
| PLAY 섹션명 = 성지순례 / 응원하기 | 디자인 명칭 채택 |

### 디자인과 의도적으로 다르게 간 곳 (2건)

1. **모임 상세 CTA 하단 고정** — Figma 는 812px 목업 안 `top 694` 지만, 실제 데이터는
   설명이 길어 스크롤이 생깁니다. CTA 가 밀려나면 골든 패스 시연에서 "신청 버튼을 찾아
   스크롤하는" 장면이 나옵니다. 되돌리려면 `.actionBar` 의 `position: fixed` 만 제거.
2. **모임 상세 금전 거래 고지 병기** — 디자인 문구("환불은 불가하며…")는 그대로 두고,
   플랫폼이 거래를 중개하지 않는다는 고지를 함께 노출합니다. `CLAUDE.md` 정책 4 —
   **협상 대상이 아닙니다.**

### 디자인에 없어서 임의 제작한 화면 (6종)

`/contents` · `/schedules` · `/play/places` · `/play/tips` · `/play/tips/:id` · `/search`

`전체보기` 링크의 목적지가 비어 있어 채웠습니다. **새 시각 언어를 만들지 않고** 기존
카드·Chip(2:1228)·Header(Back)만 재사용했습니다. 디자인이 나오면 그때 맞추면 됩니다.

---

## 8. 이 환경의 함정 (다시 밟지 말 것)

| 함정 | 대응 |
|---|---|
| **`cmd \| tail` 은 종료 코드를 가립니다** | 빌드/테스트는 `; echo EXIT=${PIPESTATUS[0]}` 로 확인. 이것 때문에 실패를 성공으로 두 번 오판했습니다 |
| **경로에 한글·공백** (`바탕 화면`) | `gradle.properties` 의 `org.gradle.jvmargs` 에 `-Dfile.encoding` 금지 → 테스트 워커 `ClassNotFoundException` |
| **Git Bash 가 한글을 CP949 로 전송** | 요청 본문·**쿼리 파라미터·heredoc 전부** 해당. 한글 본문은 파일로 저장 후 `--data-binary @file`, 쿼리는 `python -c "urllib.parse.quote(...)"` 로 직접 인코딩 |
| **`bootRun` 로그의 한글이 깨져 grep 이 안 됩니다** | ASCII 패턴(`provider=`, `AiAnalysisWarmup`)으로 grep 하세요 |
| **재기동 시 포트 8080 충돌** | gradle 래퍼를 죽여도 forked JVM 이 남습니다. `netstat -ano \| grep :8080` → `taskkill //PID <pid> //F` |
| **AI 언어 지시는 목표 언어로 써야 합니다** | 한국어 프롬프트에 "English 로 답하세요"라고 쓰면 모델이 한국어로 답합니다 (실제로 겪음) |
| **Spring Boot 4 = Jackson 3** (`tools.jackson`) | Jackson 2 기준 설정 프로퍼티는 바인딩 실패 |
| **Spring Boot 4 스타터명** | `spring-boot-starter-web` → `spring-boot-starter-webmvc` |
| **`data.sql` 이 DDL 보다 먼저 실행** | `spring.jpa.defer-datasource-initialization: true` 필수 |
| **TS 6 + `erasableSyntaxOnly`** | 생성자 파라미터 프로퍼티·`enum` 사용 불가 |
| **`openapi-typescript` 가 TS 6 과 peer 충돌** | devDependency 대신 `npx` (`npm run api:types` 에 반영됨) |
| **`<button>` 은 내용 폭으로 줄어듭니다** | `<label>` 을 버튼으로 바꿀 때 `width: 100%` 를 잊으면 폭이 줄어듭니다 (실제로 겪음) |

---

## 9. 문서 갱신 규칙

작업을 마치면 **작업한 영역의 worklog + 이 파일의 §4 진행률**을 갱신하세요.

- 백엔드 작업 → `docs/worklog-be.md`
- 프론트 작업 → `docs/worklog-fe.md`
- 새 결정 → §7 결정 로그
- 새 환경 함정 → §8 + 루트 `CLAUDE.md`
- API 계약 변경 → `docs/api-spec.yaml` 먼저, 그 다음 양쪽 코드

갱신 시 최상단 "최종 갱신" 줄의 날짜와 한 줄 요약도 함께 바꾸세요.
