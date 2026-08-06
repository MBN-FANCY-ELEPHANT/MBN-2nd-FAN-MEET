# 프론트엔드 작업 로그

> `frontend-dev` 서브에이전트와 프론트엔드 작업을 하는 세션이 **시작 시 읽고, 종료 시 갱신**하는 문서입니다.
> 전체 맥락은 `docs/HANDOFF.md` 를 먼저 보세요.

**최종 갱신:** 2026-08-07 · **전 화면 구현 완료. 목록·검색 화면은 디자인 없이 임의 제작**

> ⚠️ **먼저 읽으세요:** `docs/design-spec.md`(화면별 명세) · `docs/component-map.md`(노드 ID 매핑)
> · `docs/design-tokens.md`(실측 토큰). **스크린샷만 보고 구현하지 말고**
> `component-map.md`의 노드 ID로 `get_design_context`를 호출하세요.

---

## 1. 구현 현황

| 영역 | 파일 | 상태 |
|---|---|---|
| 앱 진입 · Provider | `src/main.tsx` | ✅ QueryClient + Router + i18n |
| 라우팅 · 음성 오버레이 상태 | `src/app/App.tsx` | ✅ 3탭 + VoiceAssistant 전역 |
| **디자인 토큰** | `src/styles/tokens.css` | ✅ **Figma 실측값 (375px, `#F58220`)** |
| 전역 스타일 | `src/styles/global.css` | ✅ `.scroll-x` / `.grid-2` |
| 공통 셸 | `src/components/layout/AppShell.tsx` | ✅ 헤더/탭바/검색/인사/배너/MicFab |
| 언어 선택 시트 | `src/components/layout/LanguageSheet.tsx` | ✅ 7개 언어 |
| Bottom Sheet · DIM | `src/components/ui/BottomSheet.tsx` | ✅ 언어·음성 공용 |
| 섹션 헤더 | `src/components/ui/Section.tsx` | ✅ 실측값 반영 |
| **음성 AI 오버레이** | `src/features/voice/VoiceAssistant.tsx` | ✅ **4단계 상태 머신 + 딥링크** |
| 음성 인식 훅 | `src/features/voice/useSpeechRecognition.ts` | ✅ Web Speech API + 폴백 |
| i18n | `src/i18n/` + `locales/*.json` | ✅ **7종, 키 81개 전부 일치** |
| API 클라이언트 | `src/api/client.ts` | ✅ 신규 계약 + SSE 파서 + Accept-Language |
| **HOME** | `src/pages/HomePage.tsx` | ✅ 일정 카드 + 아카이브 캐러셀 + 모임 2열 |
| **COMMUNITY** | `src/pages/CommunityPage.tsx` | ✅ 모임 세로 리스트 |
| **PLAY** | `src/pages/PlayPage.tsx` | ✅ 성지순례 + 응원하기 |
| **모임 상세** ★골든 패스 | `src/pages/GatheringDetailPage.tsx` | ✅ 진행률 즉시 갱신 + Toast + 정책 고지 |
| 콘텐츠 카드 (기사/영상/LIVE 분기) | `src/components/content/ContentCard.tsx` | ✅ |
| 모임 카드 (세로 / 그리드) | `src/components/gathering/GatheringCard.tsx` | ✅ |
| Toast (Success/Error/Info) | `src/components/ui/ToastProvider.tsx` | ✅ |
| StatusBadge · ProgressBar · States | `src/components/ui/` | ✅ |
| Header (Back) | `src/components/layout/HeaderBack.tsx` | ✅ |
| 포맷터 (조회수·상대시각·재생시간) | `src/lib/format.ts` | ✅ 로케일별 만/K 단위 |
| **뉴스 상세** | `src/pages/ArticleDetailPage.tsx` | ✅ AI 분석 + 용어 툴팁 + 기사에 나온 그 곳 |
| **영상 상세** | `src/pages/VideoDetailPage.tsx` | ✅ YouTube 임베드 + 구독 + 좋아요 + 공유 |
| **댓글 화면** | `src/pages/CommentPage.tsx` | ✅ 국가 배지 + 번역 토글 + 하트 |
| AI 분석 패널 | `src/components/ai/AiPanel.tsx` | ✅ 기사·영상 공용 |
| 댓글 (Reply) | `src/components/comment/Reply.tsx` | ✅ |
| 기사 본문 용어 툴팁 | `src/components/article/ArticleBody.tsx` | ✅ `[[용어\|설명]]` 파싱 |
| 간이 로그인 | `src/features/auth/` | ✅ 데모 계정 원클릭 |
| **Figma 아이콘 10종** | `src/assets/icons/` | ✅ 이모지 → 실제 SVG 교체 |
| **콘텐츠 전체 목록** | `src/pages/ContentListPage.tsx` | ✅ Chip 필터 (전체/기사/영상/LIVE) |
| **일정 전체 목록** | `src/pages/ScheduleListPage.tsx` | ✅ 예정/전체 필터, 지난 일정 흐리게 |
| **성지순례 목록** | `src/pages/PlaceListPage.tsx` | ✅ |
| **응원하기 목록** | `src/pages/TipListPage.tsx` | ✅ 카테고리 5종 필터 |
| **팁 상세** | `src/pages/TipDetailPage.tsx` | ✅ 최소 마크다운 렌더 |
| **통합 검색** | `src/pages/SearchPage.tsx` | ✅ 카테고리별 묶음 결과 |
| Chip (Default/Selected) | `src/components/ui/ChipRow.tsx` | ✅ Figma 2:1228 |

> ⚠️ 위 6개 화면은 **디자인이 제공되지 않은 화면**입니다. 새 시각 언어를 만들지 않고
> 기존 카드·Chip·Header(Back)를 재사용했습니다. 디자인이 나오면 그때 맞추세요.

`npm run build` / `npm run lint` 모두 `EXIT=0` 확인됨.

**폐기됨**: `src/pages/ChatPage.tsx` — AI 진입점이 마이크 FAB 단독으로 확정되면서
전용 채팅 라우트가 사라졌습니다. 배너 CTA 도 같은 오버레이를 엽니다.

---

## 2. 다음 작업

### ① `전체보기` 목적지 화면 (P1) ★가장 먼저

지금 링크는 걸려 있는데 라우트가 없어 빈 화면이 뜹니다:
`/contents` · `/play/places` · `/play/tips` · `/schedules` · `/play/tips/:id`

`ContentCard` / `PlaceCard` / `TipCard` 를 그대로 재사용하면 됩니다.

### ② COMMUNITY 배너 마스코트

`src/assets/mascot/bienie-banner.png` 가 커밋돼 있습니다. `AppShell` 배너 우측에 붙이세요
(Figma 6:751 — COMMUNITY 탭에서만 노출).

### ③ 검색 (P1)

검색바가 입력만 받고 동작하지 않습니다. BE `GET /search` 도 미구현입니다.

---

## 3. 참고 — 구현된 화면 스펙

### HOME (`2:204`)

`api.getHome(STAR_ID)` 한 번으로 옵니다. **응답 필드가 `archives` → `contents` 로 바뀌었습니다.**

| 섹션 | 렌더 |
|---|---|
| 다가오는 일정 | 단일 카드, bg `#F9FAFB`. 날짜 `--color-primary` Bold |
| 아카이브 | 가로 스크롤, 카드 **260×236** |
| 현재 모집 중인 모임 | 2열 그리드, 카드 **164×189**, gap 15 |

**아카이브 카드는 `type`에 따라 하단 메타와 이동 경로가 갈립니다** — `design-spec.md` §2 화면1 표 참조.

### ② COMMUNITY + 모임 상세 ★골든 패스

- 목록: 세로 리스트, 카드 **343×352**
- 상세 라우트 `/community/gatherings/:id` 신규
- **진행률이 상세 화면 하단에 고정**됩니다 (디자인 2차본에서 추가됨)
- 신청 성공 → `invalidateQueries` 로 `34/40 → 35/40` 즉시 갱신 + **`Toast (Success)`**
- 실패는 `ApiError.code` 로 분기해 **`Toast (Error)`**
  (409 `GATHERING_ALREADY_APPLIED` / 422 `GATHERING_FULL` · `GATHERING_CLOSED`)
- **금전 거래 미중개 고지를 디자인 안내 문구와 함께 노출** (`t('gathering.paymentWarning')`)

### ③ 뉴스 상세 (`6:267`) · 영상 상세 (`6:453`)

- `AiPanel`은 두 화면 **공용 컴포넌트**입니다
- 기사 본문의 용어 하이라이트는 `[[용어|설명]]` 마크업을 파싱해 툴팁으로 렌더 (별도 API 없음)
- 구독 버튼은 `구독`(검정) ↔ `구독 중`(회색) 토글
- 뉴스 하단 `기사에 나온 그 곳`은 `content.places` 를 그대로 캐러셀로

### ④ 댓글 (`6:473`)

**"글로벌 팬덤"을 증명하는 화면입니다. 완성도를 높게 잡으세요.**

- `Reply` 컴포넌트: 아바타 + 닉네임 + **국가 배지** + 작성시각 + 본문 + **번역 버튼** + 하트
- 번역: `GET /comments/{id}/translation` → 재탭 시 원문 복귀 (로컬 토글)
- 비로그인 시 입력창 비활성화 + 로그인 안내

### ⑤ 음성 AI 오버레이 — ✅ 구현됨, 마스코트만 남음

`src/features/voice/VoiceAssistant.tsx` 에 4단계 상태 머신이 동작합니다.
Web Speech API + 텍스트 폴백 + SSE 누적 렌더 + citations 딥링크까지 연결돼 있습니다.

**남은 것**: 마스코트("비엔이") 일러스트 **2포즈** (듣는 중 / 검색 중).
Figma `7:1432` / `7:1548` 에서 에셋을 내려받아 `src/assets/` 에 커밋하세요.
현재는 이모지 🎤 로 대체돼 있습니다.

> ⚠️ **시연 전 반드시 확인**: Chrome/Edge 에서 마이크 권한을 미리 허용해 두고,
> 권한을 거부했을 때 텍스트 입력으로 넘어가는지 한 번 눌러보세요. Firefox 는 미지원입니다.

### ⑥ PLAY (`2:368`)

섹션명은 **성지순례**(Place, 가로 캐러셀) / **응원하기**(Tip, 2열 그리드).
`GET /stars/{starId}/play` 한 번으로 옵니다. 지도는 카카오맵 외부 링크.

---

## 3. 코드 규약 요약

상세는 `FE/CLAUDE.md`. 핵심만:

- **색상·간격·폰트는 `src/styles/tokens.css` 변수만.** 하드코딩 금지
  (Figma 확정 시 토큰만 교체해 전체 반영하는 것이 목표)
- **문자열은 `locales/ko.json` + `en.json` 양쪽에.** 한쪽만 추가하면 언어 전환 시 키가 그대로 노출됨
- 서버 상태는 TanStack Query. `useEffect` 수동 페칭 금지
- API 호출은 `src/api/client.ts` 의 `api.*` 경유. 컴포넌트에서 `fetch` 직접 호출 금지
- 응답 타입은 `schema.d.ts` 에서 파생. 손으로 정의 금지
- 스타일은 `Component.module.css` 로 같은 폴더에
- 모바일 375px 기준. 데스크톱 분기 추가 금지

**TypeScript 6 + `erasableSyntaxOnly`** — 아래는 컴파일 에러입니다:
```ts
class A { constructor(readonly x: number) {} }  // ❌ 파라미터 프로퍼티
enum E { A, B }                                  // ❌ enum → as const 객체 사용
```

## 4. 빌드 · 검증

```bash
cd FE && npm run api:types                       # 계약이 바뀌었으면 타입 재생성
cd FE && npm run build; echo EXIT=${PIPESTATUS[0]}   # EXIT=0 을 눈으로 확인할 것
cd FE && npm run lint
```

`src/api/schema.d.ts` 는 gitignore 대상입니다. 새 환경에서는 `npm run api:types` 를 먼저 실행하세요.
