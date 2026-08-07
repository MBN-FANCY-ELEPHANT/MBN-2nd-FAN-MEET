# 인수인계 (HANDOFF)

> **다른 PC·다른 세션에서 이 프로젝트를 처음 여는 사람(또는 Claude Code)이 읽는 문서입니다.**
> 이 파일 + `docs/worklog-be.md` + `docs/worklog-fe.md` 세 개면 즉시 이어서 작업할 수 있습니다.
>
> **작업을 마칠 때마다 갱신하세요.** 갱신하지 않으면 다음 세션이 같은 작업을 반복하거나
> 이미 내린 결정을 다시 논의하게 됩니다.

**최종 갱신:** 2026-08-07 · **FE·BE·연결 전면 점검 완료.** 로그인 500 등 결함 9건 수정.

---

## 1. 30초 요약

MBN AI 해커톤 출품작 — **글로벌 트롯 팬덤 플랫폼** (React 19 + Spring Boot 4 모노레포).

**정보구조 (개편 완료본)** — 3탭 셸은 폐기됐습니다. 주 사용자층이 중장년이라 뎁스를 줄였습니다.

```
랜딩 (아티스트 13명 중 선택)
  └ 닉네임 룰렛 (로그인 대체 · 기기당 1회)
     └ 메인 /home ── LIVE 배너(YouTube) · 소식 스레드 · 큰 마이크 FAB
        ├ 소식 /feed            AI 소식 요약 + 아티스트 글 + 무대 롱폼
        ├ 방송 /broadcast       기사·롱폼·숏폼
        └ 팬공간 /fanspace      투표 배너 · 캘린더 · [모집 | 공연 | 굿즈]
```

**어느 화면에서든 마이크 FAB → 음성 AI 도우미 "비엔이"** (5단계 · 답변 후 음성으로 화면 이동).

**지금 상태: 데모 가능합니다.**

- ✅ **BE 전 도메인 완료** — 실제 호출로 전부 검증 (`worklog-be.md` §2, HANDOFF §7-1)
- ✅ **OpenAI 실연결** — `gpt-4o-mini`. 근거 선별·스코프 제한·다국어·아티스트 인식 확인
- ✅ **FE 라우트 22개** — 전부 렌더 확인, JS 에러 0
- ✅ **i18n 7개 언어 222키 parity** — 영어 전환 시 미번역 키 노출 0
- ✅ **음성 입출력 전부 무료** — 브라우저 Web Speech API (키 불필요)

**남은 일:** §5 참조. 핵심은 **시연 리허설**입니다.

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
| **`docs/design-spec.md`** | 화면별 기능 명세. ⚠️ **1차 IA(3탭) 기준입니다** — 현재 구조는 위 §1 트리를 보세요 |
| **`docs/component-map.md`** | 컴포넌트 ↔ Figma 노드 ID 매핑. ⚠️ 4단계 음성 등 일부 기술이 낡았습니다 |
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
| API 계약 | ✅ 타입 생성 검증 통과. 컨트롤러 ↔ 스펙 1:1 확인 |
| **BE — 전 도메인** | ✅ Content · Comment · Reaction · Subscription · AiAnalysis · **NewsDigest** · Chat · Auth · Place · Tip · Search |
| **BE — 동시성** | ✅ 다중 사용자 정원 경합 검증 (정원 초과 없음) |
| **BE — 인증 플로우** | ✅ 로그인 500 수정 후 좋아요·댓글·구독·모임신청 전 구간 재검증 |
| **AI — OpenAI 실연결** | ✅ `provider=live`. 선택 아티스트 인식 · 기능 안내 · 스코프 제한 동작 |
| **AI — 소식 요약** | ✅ `GET /stars/{id}/news-digest`, 실제 LLM 응답. (starId, locale) 메모리 캐시 |
| **FE — 토큰 · i18n(7종 222키)** | ✅ Figma 실측값, 375px, parity 검증 스크립트 통과 |
| **FE — 랜딩 + 닉네임 룰렛** | ✅ 아티스트 13명, 로그인 대체, 기기당 유지 |
| **FE — 음성 AI 5단계** | ✅ 단계 레일 + 주황 물감 이펙트 + 답변 후 음성 화면이동 |
| **FE — 라우트 22종** | ✅ 전부 렌더, JS 에러 0 |
| **FE — 검색 STT · 키워드 STT** | ✅ 검색창·키워드 입력에 음성 마이크 |
| **소식 스레드 (AI 요약 + 롱폼)** | ✅ AI 요약은 실제 LLM, 영상은 실제 콘텐츠 API |
| **LIVE 배너 (YouTube 임베드)** | ✅ 재생 중에만 포스터 걷음. 미재생 시 포스터가 폴백 |
| **공연 응모 · 알림 키워드** | ⚠️ 화면 완성. **상태는 이 기기 로컬 저장** (BE 도메인 없음 — 의도된 선택) |
| **전면 점검 (FE·BE·연결)** | ✅ 완료. 결함 9건 수정 (§7-1) |
| 시연 리허설 | ❌ **최우선** |

---

## 5. 남은 일 (우선순위 순)

### ① 시연 리허설 ★최우선

**전 구간이 동작합니다. 이제 끊기는 지점을 찾는 것이 남은 일입니다.**

권장 대본 (개편된 IA 기준):

1. `/` 랜딩 → 아티스트 선택 → **닉네임 룰렛** (첫 임팩트)
2. `/home` → LIVE 배너 재생 확인 → 소식 스레드
3. **마이크 FAB** → "우리 오빠 콘서트 언제야?" → 5단계 + 주황 이펙트 → 인용 카드 탭
4. 다시 마이크 → "굿즈 보고 싶어" → 음성으로 화면 이동
5. `/feed` → **AI 소식 요약** (실제 LLM) → 롱폼 영상
6. `/fanspace` → 공연 → **응모** → 응모 완료
7. **언어 전환** (한국어 → English) → 댓글 국가 배지·통화까지 바뀌는지

**리허설 전 체크리스트**

- [ ] **Chrome / Edge** 로 열 것 (Firefox 는 음성 인식 미지원 → 텍스트 폴백으로 넘어감)
- [ ] **마이크 권한 미리 허용** — 심사 중 권한 팝업이 뜨면 흐름이 끊깁니다
- [ ] 권한을 **거부했을 때** 텍스트 입력으로 넘어가는지 한 번 확인
- [ ] **시드 날짜 확인** — 오늘이 2026-08-09 를 넘기면 "다가오는 일정"이 비어 보입니다
      → `BE/src/main/resources/data.sql` 의 schedule 날짜를 미루세요
- [ ] 기동 후 **50초** 기다렸다가 기사 상세 열기 (AI 분석 워밍업이 백그라운드로 돕니다)
- [ ] `/feed` 를 **미리 한 번 열어** 소식 요약 캐시를 채워 두세요 (첫 요청만 LLM 왕복)
- [ ] **네트워크가 느리면 LIVE 배너가 포스터로 남습니다.** 고장이 아니라 설계된 폴백입니다

### ② 여유가 있으면

- **`/play/places`·`/play/tips` 진입 메뉴** — 지금은 AI 도우미 안내·인용이 유일한 진입로입니다 (§7-1)
- 실제 이미지 — 굿즈·공연 포스터가 전부 `example_hero.png`, 롱폼 썸네일도 예시 이미지입니다
- 로고 폰트 — 디자인은 `Yeongdo OTF Heavy` 23px / letter-spacing -2.76px, 지금은 Pretendard 대체
- 죽은 파일 정리 — `HomePage.tsx` · `CommunityPage.tsx` · `PlayPage.tsx` · `ui/Skeleton.tsx`

---

## 6. ⚠️ 알려진 제약

| 항목 | 내용 |
|---|---|
| **AI 기본값은 stub** | `BE/.env` 에 `AI_PROVIDER=openai` 가 없으면 템플릿 응답입니다. 기동 로그의 `provider=live` 확인 |
| **워밍업 50초** | 실연결 시 분석 24건 생성. **백그라운드라 앱은 즉시 뜨고**, 그 사이 상세 화면은 "AI 분석 준비 중"을 보여줍니다 |
| **Firefox 음성 미지원** | 텍스트 입력으로 자동 전환됩니다. 데모는 Chrome/Edge 로 |
| **비검수 번역 5종** | fr/ja/es/zh/ru 는 AI 생성 결과 그대로 (의도된 결정) |
| **예시 이미지 재사용** | 굿즈·공연 포스터 = `example_hero.png`, 랜딩 프로필 13명 = `example_profile.png` 한 장 |
| **유료 TTS 없음** | 브라우저 `speechSynthesis`. 음질이 아쉬우면 `OpenAiClient` 하단 주석 참조 |
| **공연 응모·알림 키워드는 로컬 저장** | BE 도메인이 없어 `localStorage` 입니다. **단일 기기 시연 전제** (사용자 확정). 다른 기기에서는 비어 보입니다 |
| **소식 요약 첫 요청은 느립니다** | 서버 메모리 캐시라 재기동 후 첫 요청만 LLM 왕복(수 초). 그동안 스켈레톤이 뜹니다 |
| **LIVE 배너는 네트워크를 탑니다** | 재생이 시작돼야 포스터가 걷힙니다. 느리거나 막히면 **포스터가 그대로 남는 것이 정상**입니다 |
| **투표는 빈 화면** | 투표 도메인이 없습니다. 디자인 자체가 빈 상태 기준이라 그대로 따랐습니다 |
| **`/play/places`·`/play/tips` 진입 메뉴 없음** | 개편으로 PLAY 탭이 빠졌습니다. AI 도우미 안내·인용으로만 도달합니다 |

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

### 2차 개편에서 내린 결정 (IA 대폭 변경)

| 결정 | 이유 |
|---|---|
| **3탭 셸 폐기 → 랜딩 + 메인 + 2탭** | 주 사용자층이 중장년. 뎁스를 줄이고 버튼을 키웠습니다 |
| **진입점은 랜딩(아티스트 선택)** | "MBN 방송에서 본 그 사람"으로 시작하는 서사 |
| **아티스트 13명으로 축소** | 274명은 렌더도 느리고 인지 부하도 큼. 유명세 기준 축소 |
| **로그인 대신 닉네임 룰렛** | 중장년에게 회원가입이 가장 큰 이탈 지점. 기기당 1회, 즉시 진입 |
| **음성 4단계 → 5단계** | 낭독이 끝난 뒤 "다음 지시" 단계를 명시해야 두 번째 발화가 나옵니다 |
| **단계별 이펙트 세기를 다르게** | 장식이 아니라 **상태 신호**. 화면을 안 읽어도 진행 중인지 알아야 합니다 |
| **모집 채팅은 AI 단독 응답** | 폴링·실시간 통신 없이 "채팅의 형식"만 보여줍니다. 화면에 AI 생성임을 표기 |
| **공연 응모·알림 키워드는 로컬 저장** | 계약 추가 없이 화면 흐름을 완성. **단일 기기 시연 전제** (사용자 확정) |
| **LIVE 배너는 YouTube IFrame API** | 자체 호스팅은 저작권 컷. API 키 불필요, 재생 이벤트로 포스터 제어 |
| **재생 중이 아니면 포스터로 덮음** | YouTube 가 정지·버퍼링 때 큰 재생/이전/다음 버튼을 그리는데 iframe 안이라 CSS 로 못 지웁니다 |
| **시드 스타 이름을 FE 에서 치환** | 스타가 1명뿐인데 13명 중 고르게 했습니다. `personalizeArtistNames` + BE `rewriteArtist` 양쪽 shim. **다중 스타가 생기면 둘 다 제거** |
| **소식 요약은 `analyze()` 재사용** | provider 메서드를 늘리지 않고 `kind="NEWS_DIGEST"` 로 분기 |

### 디자인과 의도적으로 다르게 간 곳 (2건)

1. **모임 상세 CTA 하단 고정** — Figma 는 812px 목업 안 `top 694` 지만, 실제 데이터는
   설명이 길어 스크롤이 생깁니다. CTA 가 밀려나면 골든 패스 시연에서 "신청 버튼을 찾아
   스크롤하는" 장면이 나옵니다. 되돌리려면 `.actionBar` 의 `position: fixed` 만 제거.
2. **모임 상세 금전 거래 고지 병기** — 디자인 문구("환불은 불가하며…")는 그대로 두고,
   플랫폼이 거래를 중개하지 않는다는 고지를 함께 노출합니다. `CLAUDE.md` 정책 4 —
   **협상 대상이 아닙니다.**

### 디자인에 없어서 임의 제작한 화면 (10종)

| 화면 | 왜 만들었나 |
|---|---|
| `/` 랜딩 | 아티스트 선택 진입점. 디자인 없이 색상만 가져와 임의 제작 |
| `/contents` · `/schedules` · `/play/places` · `/play/tips` · `/play/tips/:id` · `/search` | `전체보기` 목적지가 비어 있었음 |
| `/fanspace/concert/:id` 공연 응모 | 응모 흐름이 디자인에 없음. 굿즈 상세와 같은 어법으로 |
| `/fanspace/goods/:id` 굿즈 상세 | 판매처 연결 + 금전거래 미중개 고지 |
| `/notifications/keywords` 알림 키워드 | 드로어의 「키워드 등록」 버튼이 목적지 없이 있었음 |

**새 시각 언어를 만들지 않고** 기존 카드·Chip(2:1228)·Header(Back)·토큰만 재사용했습니다.
디자인이 나오면 그때 맞추면 됩니다.

---

## 7-1. 전면 점검 결과 (FE · BE · 연결)

**고친 것**

| 심각도 | 문제 | 조치 |
|---|---|---|
| **치명** | `POST /auth/login` 이 **모든 사용자에게 500**. `.env` 의 `AUTH_SECRET=` 이 빈 값이라 `${AUTH_SECRET:기본값}` 의 기본값이 적용되지 않고 `SecretKeySpec` 이 `Empty key` 를 던짐 → 좋아요·구독·모임신청·댓글작성 전부 불가 | `DemoTokenService` 가 **공백을 없는 값으로 취급**하고 폴백 키로 대체 + 경고 로그 |
| 중요 | AI 도우미 인용 딥링크가 엉뚱한 화면으로 감 — PLACE→모집탭, TIP→빈 투표탭, SCHEDULE 은 id 무시 | `CITATION_ROUTE` 를 `/play/places`, `/play/tips/{id}`, `/fanspace/concert/{id}` 로 교정 |
| 중요 | "성지순례 어디로 가면 돼?" 가 **SERVICE 로 오분류** — `SERVICE_WORDS` 의 "어디로" 가 먼저 걸림 | `STRONG_PLACE_WORDS` 를 SERVICE 앞에서 검사 |
| 중요 | 언어를 바꿔도 **댓글 국가 배지가 한글 고정**(글로벌이 주제인데) / 모임 참가비 `원` 하드코딩 | `country.*` 키 7개국×7언어 추가, 참가비는 `fanspace.currency` 사용 |
| 사소 | `.digestSources`·`.seatPicker` 가 CSS 에 없어 `className=undefined` | 클래스 추가 |
| 사소 | 키워드 중복 입력이 **조용히 실패** (입력창만 비워짐) | 중복 토스트 추가 |
| 사소 | `GET /chat/sessions/{id}/messages` 가 계약에 없고 아무도 안 씀 | 컨트롤러·서비스에서 제거 |
| 사소 | 관리자 재생성 API 의 403 이 스펙에 없음 | 스펙에 403 추가 |
| 사소 | 숏폼만 헤더가 `MBN AI` 로 떠 아티스트 공간을 벗어난 것처럼 보임 | 브랜드 모드로 통일 |

**확인만 하고 남겨둔 것 (의도적)**

- **`/play/places`·`/play/tips` 는 하단 네비에 진입 버튼이 없습니다.** 개편으로 PLAY 탭이
  빠지면서 생긴 공백입니다. 지금은 **AI 도우미 안내·인용이 유일한 진입로**이며, 그래서
  `ServiceCatalog` 에 성지순례·응원 준비를 넣어 두었습니다. 메뉴를 만들면 그 주석을 지우세요.
- **인기 검색어(`SearchPage.TRENDING`)는 한글 고정입니다.** 번역하면 한국어 시드 코퍼스에서
  검색 결과가 0건이 됩니다. 의도된 선택입니다.
- 죽은 파일 `HomePage.tsx` · `CommunityPage.tsx` · `PlayPage.tsx` · `ui/Skeleton.tsx` 는
  라우팅되지 않습니다. `HomePage.tsx` 는 없는 `/community` 로 링크해 이미 깨져 있으니
  **참고용으로도 믿지 마세요.**

**실제로 태워본 것** — 로그인 → 내정보 → 콘텐츠 좋아요/취소 → 댓글 작성·좋아요·번역·삭제 →
채널 구독/취소 → 모임 신청(정원 18→19)·취소(→18, `myApplication` 정확히 반영) → 위조 토큰 401.
FE 라우트 22개 전부 **JS 에러 0**, 영어 전환 시 **미번역 키 노출 0**.

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
| **Vite 가 낡은 모듈을 계속 서빙합니다** | `does not provide an export named 'default'` 인데 `npm run build` 는 EXIT=0 이면 HMR 캐시입니다. 새로고침이 아니라 **`rm -rf node_modules/.vite` + dev 서버 재시작** |
| **YouTube 임베드 차단 영상은 조용히 실패** | 검은 화면 + 스피너만 뜹니다. 영상 교체 시 임베드 가능 여부 확인 필수. **주소창에 `youtube.com/embed/...` 를 직접 여는 검증은 무의미** — 최상위 탐색이면 정상 영상도 `오류 153` |
| **`YT.Player` 는 마운트 엘리먼트를 iframe 으로 치환** | 클래스 붙은 div 를 직접 넘기면 스타일이 통째로 날아갑니다. 안에 버릴 div 를 만들어 넘기세요 |
| **`.env` 의 `KEY=` (빈 값)는 `${KEY:기본값}` 을 무력화합니다** | 환경변수가 **존재하되 비어 있으면** 기본값이 아니라 빈 문자열이 주입됩니다. `AUTH_SECRET` 이 이래서 로그인이 전부 500 이었습니다. 시크릿을 읽는 쪽에서 `isBlank()` 를 한 번 더 거르세요 |
| **모임 상태값은 `OPEN` 이 아니라 `RECRUITING`** | 스크립트로 신청 가능한 모임을 고를 때 `OPEN` 으로 찾으면 0건이 나옵니다 (`RECRUITING`/`FULL`/`CLOSED`) |

---

## 9. 문서 갱신 규칙

작업을 마치면 **작업한 영역의 worklog + 이 파일의 §4 진행률**을 갱신하세요.

- 백엔드 작업 → `docs/worklog-be.md`
- 프론트 작업 → `docs/worklog-fe.md`
- 새 결정 → §7 결정 로그
- 새 환경 함정 → §8 + 루트 `CLAUDE.md`
- API 계약 변경 → `docs/api-spec.yaml` 먼저, 그 다음 양쪽 코드

갱신 시 최상단 "최종 갱신" 줄의 날짜와 한 줄 요약도 함께 바꾸세요.
