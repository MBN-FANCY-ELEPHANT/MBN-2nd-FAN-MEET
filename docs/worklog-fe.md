# 프론트엔드 작업 로그

> `frontend-dev` 서브에이전트와 프론트엔드 작업을 하는 세션이 **시작 시 읽고, 종료 시 갱신**하는 문서입니다.
> 전체 맥락은 `docs/HANDOFF.md` 를 먼저 보세요.

**최종 갱신:** 2026-08-07 · **IA 2차 개편 반영 + 전면 점검 완료** (라우트 22개, JS 에러 0)

> ⚠️ **먼저 읽으세요:** `docs/HANDOFF.md` §1 의 **현재 IA 트리**.
> `docs/design-spec.md` 와 `docs/component-map.md` 는 **1차 IA(3탭) 기준이라 일부 낡았습니다.**
> Figma 작업 시에는 **스크린샷만 보지 말고** 노드 ID로 `get_design_context` 를 호출하세요.

---

## 0. 현재 라우트 (`src/app/App.tsx` 기준, 22개)

```
/                        랜딩 — 아티스트 13명 선택 + 닉네임 룰렛
/home                    메인 — LIVE 배너 · 소식 스레드 · 마이크 FAB
/fanspace                팬공간 — 투표 배너 · 3메뉴 · 캘린더
/feed                    소식 — AI 요약 + 아티스트 글 + 롱폼
/broadcast               방송 — 기사·롱폼·숏폼

/fanspace/:category      모집 | 공연 | 굿즈 | 투표  (한 화면의 밑줄 탭)
/fanspace/concert/:id    공연 응모          ← :category 보다 먼저 선언
/fanspace/goods/:id      굿즈 상세          ← :category 보다 먼저 선언

/live/:id                가로 영상 플레이어      /shorts/:id     숏폼 세로 플레이어
/articles/:id            기사 상세              /videos/:id     영상 상세
/articles/:id/comments   댓글 (기사·영상 공용)   /videos/:id/comments
/community/gatherings/:id 모임 상세  ★골든 패스
/search                  통합 검색 (STT 마이크)
/notifications/keywords  알림 키워드 등록 (STT 마이크)
/contents /schedules /play/places /play/tips /play/tips/:id   전체보기 목적지
```

⚠️ **`/play/places`·`/play/tips` 는 네비에 진입 버튼이 없습니다.** AI 도우미 안내·인용이
유일한 진입로입니다 (`ServiceCatalog` 참고). 메뉴를 만들면 그 주석도 지우세요.

---

## 1. 구현 현황

| 영역 | 파일 | 상태 |
|---|---|---|
| 앱 진입 · Provider | `src/main.tsx` | ✅ QueryClient + Router + i18n |
| 라우팅 · 음성/로그인 오버레이 상태 | `src/app/App.tsx` | ✅ 라우트 22개 + VoiceAssistant 전역 |
| **디자인 토큰** | `src/styles/tokens.css` | ✅ **Figma 실측값 (375px, `#F58220`)** |
| 전역 스타일 | `src/styles/global.css` | ✅ `.scroll-x` / `.grid-2` |
| **랜딩 (아티스트 선택)** | `src/pages/LandingPage.tsx` | ✅ 13명 그리드 + 사전순 + 검색 |
| **닉네임 룰렛 (로그인 대체)** | `src/features/auth/NicknameDraw.tsx` | ✅ 기기당 유지, reduced-motion 대응 |
| **메인** | `src/pages/MainPage.tsx` | ✅ LIVE 배너 + 소식 스레드 + 큰 마이크 FAB |
| **팬공간** | `src/pages/FanSpacePage.tsx` | ✅ 투표 배너 + 3메뉴 + 캘린더 타임라인 |
| **팬공간 카테고리** | `src/pages/fanspace/FanSpaceCategoryPage.tsx` | ✅ 모집·공연·굿즈·투표 밑줄 탭 |
| **공연 응모** | `src/pages/fanspace/ConcertEntryPage.tsx` | ✅ 매수 선택 → 응모 → 취소. **로컬 저장** |
| **굿즈 상세** | `src/pages/fanspace/GoodsDetailPage.tsx` | ✅ 공식 판매처 연결 + 금전거래 고지 |
| **소식** | `src/pages/FeedPage.tsx` | ✅ AI 요약(실 API) + 더미 글 + 롱폼(실 API) |
| **방송** | `src/pages/BroadcastPage.tsx` | ✅ 기사·롱폼·숏폼 탭 |
| **알림 키워드** | `src/pages/NotificationKeywordPage.tsx` | ✅ 직접입력 + STT + 추천칩. **로컬 저장** |
| 언어 선택 시트 | `src/components/layout/LanguageSheet.tsx` | ✅ 7개 언어 |
| Bottom Sheet · DIM | `src/components/ui/BottomSheet.tsx` | ✅ 언어·음성 공용 |
| **음성 AI 오버레이** | `src/features/voice/VoiceAssistant.tsx` | ✅ **5단계 + 인용 딥링크** |
| **음성 단계 레일 · 이펙트** | `src/features/voice/VoiceStages.tsx` | ✅ 주황 물감 번짐, 단계별 세기 |
| 음성 인식 훅 | `src/features/voice/useSpeechRecognition.ts` | ✅ Web Speech API + 폴백 + 경합 가드 |
| **LIVE 배너 · YouTube 훅** | `src/components/live/` | ✅ 재생 중에만 포스터 걷음 |
| i18n | `src/i18n/` + `locales/*.json` | ✅ **7종 222키 parity 검증** |
| API 클라이언트 | `src/api/client.ts` | ✅ 계약 + SSE 파서 + Accept-Language + 이름 치환 |
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
| **통합 검색** | `src/pages/SearchPage.tsx` | ✅ 카테고리별 결과 + 인기 검색어 + **STT 마이크** |
| Chip (Default/Selected) | `src/components/ui/ChipRow.tsx` | ✅ Figma 2:1228 |

> ⚠️ 디자인이 제공되지 않아 임의 제작한 화면 10종은 `HANDOFF.md` §7 표를 보세요.
> 새 시각 언어를 만들지 않고 기존 카드·Chip·Header(Back)·토큰만 재사용했습니다.

`npm run build` / `npm run lint` 모두 `EXIT=0` 확인됨.

### 폐기·사망 파일 (되살리지 마세요)

| 파일 | 왜 |
|---|---|
| `pages/ChatPage.tsx` (삭제됨) | AI 진입점이 마이크 FAB 단독으로 확정 |
| `components/layout/AppShell.tsx` (삭제됨) | 3탭 셸 폐기 |
| `pages/HomePage.tsx` · `CommunityPage.tsx` · `PlayPage.tsx` | 라우팅 안 됨. **`HomePage` 는 없는 `/community` 로 링크해 이미 깨져 있습니다 — 참고용으로도 믿지 마세요** |
| `components/ui/Skeleton.tsx` | 아무데서도 import 안 됨. 로딩은 `ui/States.tsx` 의 `LoadingState` |

### LIVE 배너 (YouTube 임베드) — 밟은 함정 3개

`src/components/live/LiveBanner.tsx` + `useYouTubePlayer.ts`.

1. **임베드가 막힌 영상은 조용히 실패합니다.** 직전 시드 `Xv8DFvPMat0` 은 KBS Kpop
   채널이라 임베드 차단(`오류 153`)이었고, 화면에는 검은 배경과 스피너만 떴습니다.
   지금은 MBN MUSIC 업로드 `d4pWjMsd0go` 를 씁니다 — **영상을 바꾸면 반드시 임베드
   가능 여부를 먼저 확인하세요.**
   ⚠️ `youtube.com/embed/...` 를 **주소창에 직접 여는 검증은 무의미합니다.**
   최상위 탐색이면 임베드 가능한 영상도 오류 153 이 납니다. 반드시 iframe 안에서 확인하세요.
2. **`YT.Player` 는 넘긴 엘리먼트를 iframe 으로 치환합니다.** `mountRef` 를 그대로 주면
   클래스가 붙은 div 가 사라져 스타일이 통째로 날아갑니다. 안에 버릴 div 를 만들어 넘깁니다.
3. **재생 중이 아닐 때는 포스터로 덮습니다.** 일시정지·버퍼링이면 YouTube 가 화면
   한가운데에 큼직한 재생/이전/다음 버튼을 그리는데 iframe 안이라 CSS 로 못 지웁니다.
   `controls=0` 도 소용없습니다. 제목 바·로고는 플레이어를 `scale(1.75)` 로 키워
   배너 밖으로 밀어냈지만, **가운데 컨트롤은 확대해도 가운데에 남습니다** — 그래서
   `PLAYING` 이 아닌 동안은 포스터를 다시 덮는 방식으로 처리했습니다.
   (백그라운드 탭에서는 버퍼링이 길어 포스터가 오래 남습니다. 정상 동작입니다.)

### 이번 회차에 추가된 화면·기능 (5건)

| 기능 | 파일 | 데이터 출처 |
|---|---|---|
| **음성 AI 5단계 + 주황 이펙트** | `features/voice/VoiceStages.tsx` `.module.css` | — |
| **검색창 STT 마이크** | `pages/SearchPage.tsx` | 브라우저 Web Speech API |
| **소식 스레드 AI 요약** | `pages/FeedPage.tsx` (`NewsDigestCard`) | **실제 API** `GET /stars/{id}/news-digest` |
| **소식 스레드 롱폼 영상** | `pages/FeedPage.tsx` (`LongformCard`) | **실제 API** `GET /contents?type=VIDEO` |
| **공연 응모** | `pages/fanspace/ConcertEntryPage.tsx` + `features/concert/concertEntry.ts` | 일정은 실제 API, **응모 상태는 로컬** |
| **알림 키워드 등록** | `pages/NotificationKeywordPage.tsx` + `features/notification/keywords.ts` | **로컬 저장** |

알아 둘 것:

- 음성은 `LISTENING → TRANSCRIBING → THINKING → ANSWERED → FOLLOW_UP` 5단계입니다.
  마지막 단계는 **TTS 낭독이 끝나면** 넘어갑니다(`useSpeech().speaking` 이 false 가 될 때).
  TTS 미지원 브라우저면 답변 직후 바로 넘어갑니다.
- 주황 이펙트는 단계마다 **속도·확산 거리**가 다릅니다(`--burst-speed` / `--burst-spread`).
  장식이 아니라 상태 신호라서, 값을 통일하면 "분석 중"인지 알 수 없게 됩니다.
- **응모·키워드는 `localStorage` 입니다.** 다른 기기에서는 비어 있습니다.
  응모는 추첨 신청일 뿐 결제가 아니며 화면에 그 고지가 반드시 남아 있어야 합니다.
- 소식 스레드에는 **더미(아티스트 글·공지)와 실제 API(영상·AI 요약)가 섞여 있습니다.**
  걷어낼 때 헷갈리지 마세요.

### 시드 스타 이름 치환 — 임시 조치

`personalizeArtistNames()` (`src/features/artist/selectedArtist.ts`) 를
`api/client.ts` 의 `request()` 에서 **모든 응답에 한 번** 적용합니다.
스타가 `STAR_ID = 1` 하나뿐이라 캘린더·모임·콘텐츠 제목에 `임영웅` 이 박혀 있는데,
랜딩에서 `이찬원` 을 고른 사용자에게 그대로 보이면 데모가 깨집니다.
BE 도 AI 답변에서 같은 치환을 합니다(`ChatService.rewriteArtist`).
**다중 스타가 생기면 양쪽 다 걷어내세요.**

---

## 2. 다음 작업

**전 화면이 동작합니다.** 아래는 있으면 좋은 것들이고, 없어도 시연은 됩니다.

### ① 성지순례·응원 진입 메뉴 (P1)

`/play/places` · `/play/tips` 가 **네비에서 도달 불가**합니다. PLAY 탭이 빠지면서 생긴 공백이라
지금은 AI 도우미만 안내합니다. 팬공간 메뉴에 2개를 더하는 게 가장 싼 해법입니다
(`FanSpacePage.tsx` 의 `MENU` 배열 + 아이콘 2종).
넣으면 `BE/.../ServiceCatalog.java` 의 "진입 버튼 없음" 주석도 지우세요.

### ② 실제 이미지 (P2)

굿즈·공연 포스터가 전부 `example_hero.png`, 랜딩 프로필 13명이 `example_profile.png`
한 장입니다. 심사에서 가장 먼저 눈에 띄는 부분입니다.

### ③ 로고 폰트 (P2)

디자인은 `Yeongdo OTF Heavy` 23px / letter-spacing -2.76px 인데 폰트 파일이 없어
Pretendard 로 대체돼 있습니다. **이미지로 빼면 안 됩니다** — 아티스트마다 글자가
달라져서(매일서진 / 매일찬원 …) 동적 대응이 불가능합니다.

### ④ 죽은 파일 정리 (P3)

§1 하단 표의 4개 파일. 지우기만 하면 됩니다.

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
