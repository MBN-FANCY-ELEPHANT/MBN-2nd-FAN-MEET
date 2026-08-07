# 프론트엔드 작업 로그

> `frontend-dev` 서브에이전트와 프론트엔드 작업을 하는 세션이 **시작 시 읽고, 종료 시 갱신**하는 문서입니다.
> 전체 맥락은 `docs/HANDOFF.md` 를 먼저 보세요.

**최종 갱신:** 2026-08-08 · **팀 브랜치 병합 완료.** 게스트 인증 + 음성 액션 5종 + 모집 대화방.

> ⚠️ **먼저 읽으세요:** `docs/HANDOFF.md` §1 의 **현재 IA 트리**.
> `docs/design-spec.md` 와 `docs/component-map.md` 는 **1차 IA(3탭) 기준이라 일부 낡았습니다.**
> Figma 작업 시에는 **스크린샷만 보지 말고** 노드 ID로 `get_design_context` 를 호출하세요.
> ⚠️ 단, 음성 오버레이(`7:1432`) 등 **화면 노드는 이 파일에서 더 이상 조회되지 않습니다** —
> MCP 에 `components` 페이지만 남아 있습니다. 재실측이 필요하면 새 노드 URL 을 받으세요.

---

## 0. 현재 라우트 (`src/app/App.tsx` 기준, 23개)

```
/                        랜딩 — 아티스트 13명 선택 + 닉네임 룰렛(게스트 계정 발급)
/home                    메인 — LIVE 배너 · 소식 스레드 · 마이크 FAB
/fanspace                팬공간 — 투표 배너 · 메뉴 타일 · 캘린더
/feed                    소식 — AI 요약 + 아티스트 글 + 롱폼
/broadcast               방송 — 기사·롱폼·숏폼

/fanspace/:category      모집 | 공연 | 굿즈 | 투표
/fanspace/concert/:id    공연 응모          ← :category 보다 먼저 선언
/fanspace/goods/:id      굿즈 상세          ← :category 보다 먼저 선언

/live/:id                가로 영상 플레이어      /shorts/:id     숏폼 세로 플레이어
/articles/:id            기사 상세              /videos/:id     영상 상세
/articles/:id/comments   댓글 (기사·영상 공용)   /videos/:id/comments
/community/gatherings/:id 모임 상세  ★골든 패스
/community/gatherings/:id/chat  참여 중인 모집 **단체 대화방** ← :id 보다 먼저 선언
/search                  통합 검색 (STT 마이크)
/notifications/keywords  알림 키워드 등록 (STT 마이크)
/contents /schedules /play/places /play/tips /play/tips/:id   전체보기 목적지
```

⚠️ **`/play/places`·`/play/tips` 는 네비에 진입 버튼이 없습니다.** AI 도우미 안내·인용이
유일한 진입로입니다 (`ServiceCatalog` 참고). 메뉴를 만들면 그 주석도 지우세요.

⚠️ **팬공간 상단 밑줄 탭바는 제거됐습니다** (팀 결정). 카테고리 진입은 `FanSpacePage` 의
메뉴 타일이 담당하므로, 공연 탭에서 모집 탭으로 **가로 이동하는 경로가 없습니다.**

---

## 0-1. 모집 단체 대화방

`/community/gatherings/:id/chat` — 팬공간 「**참여 중인 모집 채팅방**」 카드의 목적지입니다.

⚠️ **실시간 채팅이 아닙니다.** 폴링도 소켓도 없습니다. `docs/mvp-scope.md` 에서 실시간
채팅은 컷됐고, 결정 로그가 "모집 채팅은 **AI 단독 응답**, 채팅의 형식만 보여준다" 로
확정했습니다. 그래서:

- 다른 참여자 말풍선은 **정적 예시**입니다 (`src/data/gatheringChat.ts`, 모임 종류별로 다름)
- 실제로 답하는 것은 **AI 도우미 비엔이** 하나뿐이고 답변마다 AI 배지를 답니다
- **신청한 사람만** 들어옵니다. 주소를 직접 열면 안내 + 상세 링크가 뜹니다

**상단 AI 요약 패널** (Figma `27:6525` "AI Pannal" — 화면 `27:6522`).
"AI가 톡방을 분석한 내용입니다" 아래에 **모임 종류별로 다른 주제**를 뽑아 보여줍니다.

| 종류 | 주제 3개 |
|---|---|
| `BUS` | 이동(요약) · 집결(집결지 · 행사일시) · 참가(인원 · 참가비) |
| `DONATION` | 기부처(요약) · 모금 규모(1인 최소액 · 참여 인원) · 공개(공지) |

⚠️ **요약 값은 지어내지 않습니다.** 전부 그 모임의 실제 DB 값에서 옵니다
(`summaryItems()`). 참여자 말풍선은 예시지만 요약은 진짜 정보라, "AI 가 톡방을
분석했다" 는 화면 문구가 거짓이 되지 않습니다.
⚠️ **예시 대화와 요약 주제를 따로 놀게 두지 마세요.** 대화가 딴 얘기를 하면 요약이
대화를 요약한 것처럼 보이지 않습니다 — `data/gatheringChat.ts` 주석 참고.
⚠️ 패널 생김새는 **기사·영상 상세의 AI 패널과 같은 컴포넌트**입니다
(`components/ai/AiSummaryCard.tsx` + `AiPanel.module.css`). 한쪽만 고치면 갈라집니다.

⚠️ 예전에 있던 **"참여자 대화는 예시입니다" 고지와 집결지·일시 3줄 카드는 걷어냈습니다**
(사용자 요청 + 디자인에 없음). 모임 정보는 위 요약 항목이 대신 전달합니다.

⚠️ **세션을 열 때 `gatheringId` 를 반드시 넘기세요.** 안 넘기면 AI 가 어느 모임인지 몰라
"집결지 어디예요?" 에도 **"정보를 제공할 수 없습니다"** 라고 답합니다 (실제로 겪음).
넘기면 그 모임의 집결지·행사일·참가비·공지가 모든 질문의 근거로 항상 들어갑니다.

⚠️ 대화방에서도 "신청 취소해줘" 같은 **액션이 실제로 실행됩니다.** 확인 문구는 음성
오버레이와 **같은 키**를 씁니다 (`features/voice/actionMessage.ts`) — 한쪽만 고치면
같은 액션이 화면마다 다르게 안내됩니다.

---

## 0-2. 아티스트 소식 스레드 (메인 · 소식 탭 공용)

`components/feed/FeedThread.tsx` — **메인페이지와 `/feed` 가 같은 컴포넌트**를 씁니다
(Figma `27:6288`). 한쪽만 고치면 두 화면이 갈라집니다.

세 종류가 **한 타임라인에 최신순**으로 섞이고, 전부 `Content` API 실데이터입니다:

| 종류 | 판별 | 렌더 |
|---|---|---|
| 아티스트 글 | `type=POST` · `author.type=STAR` | 아바타 + 사진 + 본문 |
| 팬매니저 공지 | `type=POST` · `author.type=MANAGER` | 마스코트 + 종 + 연한 오렌지 말풍선 |
| 무대 롱폼 | `type=VIDEO` | 썸네일 + 재생 마크 + 재생시간 |

셋 다 **좋아요(실제 토글)와 댓글**이 붙습니다. 댓글은 `/posts|videos/{id}/comments`.

⚠️ **`liked` 는 목록 응답에도 있어야 합니다** (계약에 추가함). 없으면 하트를 눌러도
채워지지 않아 **누른 티가 전혀 나지 않습니다** — `likeCount` 는 화면에서 만 단위로
반올림돼(12,300 → "1.2만") 1 증가가 보이지 않기 때문입니다. BE 는 목록 id 를 모아
**한 번의 `IN` 조회**로 채웁니다 (건별 조회는 N+1).

⚠️ **팬매니저 공지의 작성 주체는 AI 도우미 "비엔이" 이며 스타 본인이 아닙니다**
(기획서 5-2). 아바타·이름을 아티스트와 다르게 그리고, 스레드 하단에 고지
(`feed.managerNotice`)를 답니다. 이 구분을 없애면 공지가 아티스트 글처럼 보입니다.

⚠️ 디자인은 공지에 **좋아요만** 있지만, 요청에 따라 **댓글도** 붙였습니다.

⚠️ 정적 더미 `src/data/feed.ts` 는 **삭제했습니다.** 되살리지 마세요 — 전부 실 API 입니다.

---

## 1. 구현 현황

| 영역 | 파일 | 상태 |
|---|---|---|
| 앱 진입 · Provider | `src/main.tsx` | ✅ QueryClient + Router + i18n |
| 라우팅 · 음성/로그인 오버레이 상태 | `src/app/App.tsx` | ✅ 라우트 23개 + VoiceAssistant 전역 |
| **디자인 토큰** | `src/styles/tokens.css` | ✅ **Figma 실측값 (375px, `#F58220`)** |
| 전역 스타일 | `src/styles/global.css` | ✅ `.scroll-x` / `.grid-2` |
| **랜딩 (아티스트 선택)** | `src/pages/LandingPage.tsx` | ✅ 13명 그리드 + 사전순 + 검색 |
| **메인** | `src/pages/MainPage.tsx` | ✅ LIVE 배너 + 소식 스레드 + 큰 마이크 FAB |
| **팬공간** | `src/pages/FanSpacePage.tsx` | ✅ 투표 배너 + 3메뉴 + 캘린더 타임라인 |
| **팬공간 카테고리** | `src/pages/fanspace/FanSpaceCategoryPage.tsx` | ✅ 모집·공연·굿즈·투표 (상단 탭바 없음) |
| **공연 응모** | `src/pages/fanspace/ConcertEntryPage.tsx` | ✅ **「응모하기」 버튼 하나 (1인 1매)**. **실제 API** |
| **굿즈 상세** | `src/pages/fanspace/GoodsDetailPage.tsx` | ✅ 공식 판매처 연결 + 금전거래 고지 |
| **소식** | `src/pages/FeedPage.tsx` | ✅ AI 요약(실 API) + 더미 글 + 롱폼(실 API) |
| **방송** | `src/pages/BroadcastPage.tsx` | ✅ 기사·롱폼·숏폼 탭 |
| **알림 키워드** | `src/pages/NotificationKeywordPage.tsx` | ✅ 직접입력 + STT + 추천칩. **로컬 저장** |
| 언어 선택 시트 | `src/components/layout/LanguageSheet.tsx` | ✅ 7개 언어 |
| Bottom Sheet · DIM | `src/components/ui/BottomSheet.tsx` | ✅ 언어·음성 공용 |
| **음성 AI 오버레이** | `src/features/voice/VoiceAssistant.tsx` | ✅ **5단계 + 인용 딥링크 + 기능 완료 액션** |
| **무대 영상 카드** | `src/features/voice/StageVideoCard.tsx` | ✅ 시트 안 iframe 재생 (URL 은 BE 시드) |
| **게스트 계정 발급** | `src/features/auth/NicknameDraw.tsx` | ✅ `POST /auth/guest` — 서버가 닉네임·토큰 발급 |
| **음성 단계 레일 · 이펙트** | `src/features/voice/VoiceStages.tsx` | ✅ 주황 물감 번짐, 단계별 세기 |
| 음성 인식 훅 | `src/features/voice/useSpeechRecognition.ts` | ✅ Web Speech API + 폴백 + 경합 가드 |
| **LIVE 배너 · YouTube 훅** | `src/components/live/` | ✅ 재생 중에만 포스터 걷음 |
| i18n | `src/i18n/` + `locales/*.json` | ✅ **7종 259키 parity 검증** |
| API 클라이언트 | `src/api/client.ts` | ✅ 계약 + SSE 파서 + Accept-Language + 이름 치환 |
| **모임 상세** ★골든 패스 | `src/pages/GatheringDetailPage.tsx` | ✅ 진행률 즉시 갱신 + Toast + 정책 고지 |
| **모집 단체 대화방** | `src/pages/GatheringChatPage.tsx` | ✅ 예시 대화 + **AI 단독 응답**. 신청자만 입장 |
| 콘텐츠 카드 (기사/영상/LIVE 분기) | `src/components/content/ContentCard.tsx` | ✅ |
| 모임 카드 (세로 / 그리드) | `src/components/gathering/GatheringCard.tsx` | ✅ |
| Toast (Success/Error/Info) | `src/components/ui/ToastProvider.tsx` | ✅ |
| StatusBadge · ProgressBar · States | `src/components/ui/` | ✅ |
| Header (Back) | `src/components/layout/HeaderBack.tsx` | ✅ |
| 포맷터 (조회수·상대시각·재생시간) | `src/lib/format.ts` | ✅ 로케일별 만/K 단위 |
| **뉴스 상세** | `src/pages/ArticleDetailPage.tsx` | ✅ AI 분석 + 용어 툴팁 + 기사에 나온 그 곳 |
| **영상 상세** | `src/pages/VideoDetailPage.tsx` | ✅ YouTube 임베드 + 구독 + 좋아요 + 공유 |
| **댓글 화면** | `src/pages/CommentPage.tsx` | ✅ 기사·영상·아티스트 POST 공용, 국가 배지 + 번역 토글 + 하트 |
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

### 데이터 출처 — 실제 API 와 더미가 섞여 있습니다

걷어내거나 갈아끼울 때 헷갈리기 쉬운 자리만 모았습니다.

| 화면·기능 | 데이터 출처 |
|---|---|
| 소식 스레드 AI 요약 | **실제 API** `GET /stars/{id}/news-digest` |
| 소식 스레드 롱폼 영상 | **실제 API** `GET /contents?type=VIDEO` |
| 소식 스레드 아티스트 글·공지 | **더미** `src/data/feed.ts` |
| 공연 응모 | **실제 API** `POST·DELETE·GET /schedules/{id}/entry` |
| 모집 신청·내 신청 목록 | **실제 API** `POST .../applications`, `GET /gatherings/mine` |
| 모집 대화방 참여자 말풍선 | **더미** `src/data/gatheringChat.ts` (답변만 실제 AI) |
| 굿즈 | **더미** `src/data/goods.ts` |
| 무대 영상 URL | **실제 API** — BE `artist_stage` 시드 (LLM 생성 아님) |
| 알림 키워드 | **로컬 저장** `localStorage` — 다른 기기에서는 비어 있습니다 |

알아 둘 것:

- 음성은 `LISTENING → TRANSCRIBING → THINKING → ANSWERED → FOLLOW_UP` 5단계입니다.
  마지막 단계는 **TTS 낭독이 끝나면** 넘어갑니다(`useSpeech().speaking` 이 false 가 될 때).
  TTS 미지원 브라우저면 답변 직후 바로 넘어갑니다.
  ⚠️ **상단 5단계 레일은 걷어냈습니다** — 주황 이펙트가 지금은 유일한 진행 신호입니다.
- 주황 이펙트는 단계마다 **속도·확산 거리**가 다릅니다(`--burst-speed` / `--burst-spread`).
  장식이 아니라 상태 신호라서, 값을 통일하면 "분석 중"인지 알 수 없게 됩니다.
- **응모는 추첨 신청일 뿐 결제가 아니며** 화면에 그 고지가 반드시 남아 있어야 합니다.
- **쓰기 API 에는 서버 토큰이 필요합니다.** 닉네임 룰렛이 `POST /auth/guest` 로
  **게스트 계정 + 토큰**을 발급하므로 확정 즉시 좋아요·댓글·응모·모임 신청이 됩니다.
  닉네임도 서버가 중복 없이 배정합니다 (`docs/api-changes-guest-identity.md`).

### 시드 스타 이름 치환 — 임시 조치

`personalizeArtistNames()` (`src/features/artist/selectedArtist.ts`) 를
`api/client.ts` 의 `request()` 에서 **모든 응답에 한 번** 적용합니다.
스타가 `STAR_ID = 1` 하나뿐이라 캘린더·모임·콘텐츠 제목에 `임영웅` 이 박혀 있는데,
랜딩에서 `이찬원` 을 고른 사용자에게 그대로 보이면 데모가 깨집니다.
BE 도 AI 답변에서 같은 치환을 합니다(`ChatService.rewriteArtist`).
**다중 스타가 생기면 양쪽 다 걷어내세요.**

---

## 1-1. 음성 브리프 (이 섹션만 읽으면 음성 작업을 이어갈 수 있습니다)

### 파일 지도

| 파일 | 역할 |
|---|---|
| `VoiceAssistant.tsx` | 5단계 상태 머신 · 세션 · SSE 수신 · 인용 딥링크 · **액션 결과 렌더** |
| `voiceCommands.ts` | **LLM 없이** 키워드로 화면 이동 판정 + **`isActionRequest` 가드** |
| `StageVideoCard.tsx` | 무대 영상(롱폼) 카드 — 시트 안에서 바로 재생 |
| `useSpeechRecognition.ts` | STT (Web Speech API) + 폴백 + 경합 가드 |
| `useSpeech.ts` | TTS (`speechSynthesis`) + 음성 선택 |
| `VoiceStages.tsx` | 5단계 레일 + 주황 물감 이펙트 |
| `mascot.ts` | 단계별 마스코트 포즈 |

BE 쪽은 `chat/service/VoiceActionResolver.java`(**행동 판정·실행**) ·
`EvidenceFinder.java`(의도 분류) · `ServiceCatalog.java`(기능 목록) ·
`ai/provider/openai/OpenAiProvider.java`(프롬프트) 넷입니다.

### 지금 동작하는 것

```
발화 → STT 실시간 표시
     → isActionRequest() 면 이동 가로채기를 건너뜁니다
     → matchVoiceCommand() 로 이동 명령인지 판정 → 명령이면 즉시 화면 이동 (LLM 왕복 0)
     → 아니면 SSE
        ├ action 이벤트  : 서버가 **이미 실행한** 결과 → 확인 문구 + 토스트 + 후속 버튼
        └ delta 이벤트   : AI 답변 → 인용 카드 탭 → 해당 화면
     → 낭독이 끝나면 FOLLOW_UP 단계 → 다시 말하면 이어서 진행
```

### 음성 "기능 완료" 액션 5종

말로 **끝까지 처리**됩니다. 안내만 하던 이전 동작에서 바뀐 부분입니다.

| 발화 예 | 액션 | 실행 |
|---|---|---|
| "가장 가까운 공연에 대한 표를 응모해줘" | `CONCERT_ENTRY` | `POST /schedules/{id}/entry` |
| "내가 응모한 공연 응모 취소해줘" | `CONCERT_ENTRY_CANCEL` | `DELETE /schedules/{id}/entry` |
| "대전에서 서울로 가는 버스 대절에 참여 신청해줘" | `GATHERING_JOIN` | `POST /gatherings/{id}/applications` |
| "모집 신청 취소해줘" | `GATHERING_CANCEL` | `DELETE /gatherings/{id}/applications/me` |
| "이찬원 무대 보여줘" | `STAGE_VIDEO` | 조회 전용 — 시트 안에서 바로 재생 |

- **화면을 이동시키지 않습니다.** 응모가 끝났다는 사실을 읽기도 전에 시트가 닫히면
  무슨 일이 일어난 건지 알 수 없습니다. 이동은 후속 버튼(`응모한 공연 페이지로 이동` /
  `메인 페이지로 이동`)으로 **사용자가 고릅니다.** 마이크는 그대로 살아 있습니다.
- **확인 문구는 FE 가 만듭니다** (`voice.action.*`, 7개 언어). 서버는 `type` + `status` 만
  줍니다 — 서버가 문장을 내려주면 번역이 BE/FE 두 군데로 갈라집니다.
- **액션 턴은 LLM 을 호출하지 않습니다.** 창작할 것이 없고, 모델에 맡기면 실행하지도 않은
  일을 했다고 말할 위험이 있습니다.

### ⚠️ 착수 전에 알아야 할 설계 제약 (건드리면 되살아나는 버그들)

0-A. **마스코트 크기는 Figma 실측(276px)보다 일부러 작습니다** (사용자 요청).
   Figma 프레임은 276×276 인데 **에셋이 정사각형이 아니라** `height: auto` 로 두면
   276×310 으로 렌더되고, 실제 뷰포트는 목업의 812px 가 아니라 730px 안팎이라
   **화면 높이의 42%** 를 먹었습니다. 지금은 `min(190px, 52%)` 로 약 29% 입니다.
   가로 위치는 `left` 고정 좌표가 아니라 **`right: -8%`** 로 잡습니다 — 캔버스 폭이
   375 든 430 이든 Figma 와 같은 비율(30px)로 오른쪽이 잘립니다.
   ⚠️ 이 파일의 Figma 노드(`7:1432`)는 **더 이상 조회되지 않습니다** — MCP 에 `components`
   페이지만 남아 있습니다. 재실측이 필요하면 사용자에게 새 노드 URL 을 받으세요.

0-0. **시트에서 걷어낸 두 가지 (사용자 요청 — 되살리지 마세요).**
   ① **상단 5단계 레일**(`VoiceStageRail`). 단계 상태 자체는 남아 있고 마이크 뒤 주황
   이펙트가 여전히 진행을 알려줍니다 — 그래서 이제 **이펙트가 유일한 진행 신호**입니다.
   단계별 `--burst-speed`/`--burst-spread` 를 통일하지 마세요.
   ② **하단 "MBN 공식 AI 도우미입니다. 스타 본인이 아닙니다." 고지**.
   사칭 방지 정책은 그대로입니다 — 시스템 프롬프트가 담당하고, 소식 스레드 AI 요약 카드에
   AI 생성 표기가 남아 있습니다. `chat.disclaimer` 와 `voice.step.*` 키는 **지우지 않았으니**
   되살리려면 JSX 만 되돌리면 됩니다.

0-1. **음성 시트의 높이 규칙을 건드리지 마세요.** 답변 + 무대 영상 + 후속 버튼이 들어가면
   내용이 시트 밖으로 흘러 **화면 아래로 잘렸습니다.** 시트 자체는 스크롤시킬 수 없습니다 —
   마스코트가 시트 위로 튀어나와야 해서 `overflow` 를 자를 수 없기 때문입니다. 그래서
   **답변 영역(`.stage`)만** 자기 안에서 스크롤하고 단계 레일·마이크는 고정입니다.
   `.stageInner` 의 `margin: auto 0` 을 `justify-content: center` 로 바꾸면 **내용이 길 때
   위쪽이 잘려 스크롤로도 못 돌아갑니다** (flex 의 고전적인 함정).
0. **`isActionRequest()` 가드를 빼지 마세요.** `"이찬원 무대 영상 보여줘"` 가 `"영상"` +
   `"보여"` 에 걸려 **방송 화면으로 튀고** 무대 영상은 안 나옵니다. `"버스 대절 신청해줘"` 도
   `"버스"` 때문에 모집 목록으로 튑니다 — 신청은 안 되고요.
   판정 어휘는 BE `VoiceActionResolver` 와 **같은 편**으로 유지하세요.
1. **이동 동사가 없으면 명령이 아닙니다.** `NAVIGATION_VERBS` 조건을 풀면
   `"콘서트가 언제야?"` 가 질문인데 공연 화면으로 튑니다. 단, 직전 답변이 **기능 안내**였다면
   (`afterFeatureAnswer`) 동사 없이 `"공연"` 한 단어만으로도 이동합니다.
2. **STT 를 stop 할 때 핸들러를 먼저 null 로 만들고 abort 해야 합니다.**
   안 그러면 죽은 인식기의 `onend` 가 뒤늦게 발화해 `listening` 을 덮어씁니다.
   StrictMode 이중 실행 때문에 **첫 시도에서만** 실시간 표시가 안 되는 증상이 났었습니다.
3. **5단계째(FOLLOW_UP)는 TTS 낭독이 끝나야 넘어갑니다** (`useSpeech().speaking`).
   TTS 미지원 브라우저면 답변 직후 바로 넘어갑니다.
4. **THINKING 에서 마이크를 비활성화하는 건 연출이 아니라 중복 요청 차단입니다.**
5. **인용 라우트 표(`CITATION_ROUTE`)는 실제 라우트와 어긋나기 쉽습니다.**
   PLACE·TIP·SCHEDULE 은 서버가 `route` 를 안 채워 항상 이 표를 탑니다.
6. **이펙트 세기는 상태 신호입니다.** 단계별 `--burst-speed`/`--burst-spread` 를 통일하면
   화면을 안 읽는 사용자가 진행 중인지 알 수 없게 됩니다.

### ⚠️ 검증 방법 — 여기가 병목입니다

**음성 입력은 Claude 가 검증할 수 없습니다.** 마이크로 말을 할 수 없어서, 브라우저 자동화로는
"버튼이 켜졌다" 까지만 확인됩니다. 그래서 작업 루프는 이렇게 잡는 게 가장 빠릅니다:

1. Claude 가 코드 수정 → 빌드 통과 확인
2. **사용자가 직접 말해보고** 증상을 알려줌
3. 필요하면 `useSpeechRecognition` 에 임시 `console.log` 를 넣고
   `read_console_messages` 로 확인 (스크린샷보다 훨씬 빠릅니다)

STT 없이 확인 가능한 부분은 폴백 텍스트 입력창으로 대신 태울 수 있습니다
(마이크 권한을 거부하면 나타납니다).

### 검증한 것 / 남은 것

**실제로 태워본 것** (텍스트 폴백 입력으로 액션 경로 전체를 구동):

- 응모 액션 → "'이찬원의 팬미팅' 응모가 완료되었습니다." + 후속 버튼 2개 + 이동 없음
- 모집 액션 → "'0829 관광 버스 대절 모집 (대전 출발)' 참여 신청이 완료되었습니다."
- 무대 영상 → 시트 안 iframe 재생 (임베드 정상)
- `"굿즈 보여줘"` 는 여전히 즉시 이동 — 가드가 기존 동작을 깨지 않았습니다
- JS 에러 0

**미검증으로 남아 있는 것**

- **실제 마이크 발화로 액션이 트리거되는지** — Claude 는 말을 할 수 없습니다.
  STT 가 조사·띄어쓰기를 어떻게 끊는지에 따라 `IMPERATIVES` 매칭이 빗나갈 수 있으니
  **사용자가 직접 말해보고** 안 걸리는 표현을 알려주세요. 그 표현을 목록에 더하면 됩니다.
- 첫 시도 STT 실시간 표시 (경합은 코드로 고쳤지만 실제 음성으로는 미검증)
- 7개 언어 중 ko/en 외 STT 인식 품질 · 액션 어휘는 **ko/en 만** 다룹니다

---

## 2. 다음 작업

### ⓪ 무대 영상 URL 교체 ★남은 유일한 구멍

`BE/src/main/resources/data.sql` 의 `artist_stage` 13행이 **전부 같은 영상**
(`d4pWjMsd0go`, MBN MUSIC 업로드)을 가리킵니다. 임베드 검증이 끝난 유일한 ID 라 우선
넣어 둔 것이고, 그래서 지금은 "이찬원 무대 보여줘" 에 박서진 영상이 나옵니다.

아티스트별 실제 무대 영상 URL 13개를 채우면 끝납니다.
⚠️ 교체할 때는 **반드시 iframe 안에서** 재생을 확인하세요 — 주소창에 embed URL 을
직접 여는 검증은 무의미합니다 (정상 영상도 오류 153).

아래는 그 외에 있으면 좋은 것들이고, 없어도 시연은 됩니다.

### ① 성지순례·응원 진입 메뉴 (P1)

`/play/places` · `/play/tips` 가 **네비에서 도달 불가**합니다. PLAY 탭이 빠지면서 생긴 공백이라
지금은 AI 도우미만 안내합니다. 팬공간 메뉴에 2개를 더하는 게 가장 싼 해법입니다
(`FanSpacePage.tsx` 의 `MENU` 배열 + 아이콘 2종).
넣으면 `BE/.../ServiceCatalog.java` 의 "진입 버튼 없음" 주석도 지우세요.

### ② 실제 이미지 (P2)

굿즈·공연 포스터가 전부 `example_hero.png`, 랜딩 프로필 13명이 `example_profile.png`
한 장입니다. 심사에서 가장 먼저 눈에 띄는 부분입니다.

### ③ 죽은 파일 정리 (P3)

§1 하단 표의 4개 파일. 지우기만 하면 됩니다.

### 해결된 항목 (되돌아갈 필요 없음)

- ~~로고 폰트 (Pretendard 대체)~~ → **`YeongdoOTF-Heavy.woff2` 적용 완료** (팀 작업).
  이미지로 빼지 않은 것은 의도적입니다 — 아티스트마다 글자가 달라집니다(매일서진 / 매일찬원 …).
- ~~응모 상태가 로컬 저장~~ → BE `ConcertEntry` 도메인으로 승격
- ~~닉네임 룰렛 뒤 쓰기 API 가 401~~ → `POST /auth/guest` 로 게스트 계정·토큰 발급

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

### ⑤ 음성 AI 오버레이 — ✅ 완료

`src/features/voice/VoiceAssistant.tsx` 에 5단계 상태 머신이 동작합니다.
Web Speech API + 텍스트 폴백 + SSE 누적 렌더 + citations 딥링크 + **기능 완료 액션 5종**
(§1-1) 까지 연결돼 있습니다. 마스코트 2포즈(듣는 중 / 검색 중)도 실제 에셋입니다
(`src/assets/mascot/bienie-listening|thinking`).

상세 설계 제약은 **§1-1 음성 브리프**에 있습니다. 특히 시트 높이·마스코트 크기·
걷어낸 UI 두 가지는 되돌리기 쉬우니 먼저 읽으세요.

> ⚠️ **시연 전 반드시 확인**: Chrome/Edge 에서 마이크 권한을 미리 허용해 두고,
> 권한을 거부했을 때 텍스트 입력으로 넘어가는지 한 번 눌러보세요. Firefox 는 미지원입니다.

### ⑥ PLAY (`2:368`)

섹션명은 **성지순례**(Place, 가로 캐러셀) / **응원하기**(Tip, 2열 그리드).
`GET /stars/{starId}/play` 한 번으로 옵니다. 지도는 카카오맵 외부 링크.

---

## 4. 코드 규약 요약

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

## 5. 빌드 · 검증

```bash
cd FE && npm run api:types                       # 계약이 바뀌었으면 타입 재생성
cd FE && npm run build; echo EXIT=${PIPESTATUS[0]}   # EXIT=0 을 눈으로 확인할 것
cd FE && npm run lint
```

`src/api/schema.d.ts` 는 gitignore 대상입니다. 새 환경에서는 `npm run api:types` 를 먼저 실행하세요.
