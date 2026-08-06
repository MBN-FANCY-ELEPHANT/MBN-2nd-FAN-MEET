# 컴포넌트 맵 — Figma ↔ 코드

**최종 갱신:** 2026-08-06 · 디자인 2차본 기준 최초 작성

`fileKey: 71R3xxvzqYiDB6vjpfZUKR`
정밀 스펙이 필요할 때는 아래 노드 ID로 `get_design_context`를 호출하세요.
**노드 ID 없이 스크린샷만 보고 구현하지 마세요.**

---

## 1. 라우트 트리

```
/                            HomePage              탭 셸
/community                   CommunityPage         탭 셸
/community/gatherings/:id    GatheringDetailPage   Header(Back)
/play                        PlayPage              탭 셸
/articles/:id                ArticleDetailPage     Header(Back)
/videos/:id                  VideoDetailPage       Header(Back)
/videos/:id/comments         CommentPage           Header(Back) — 영상/기사 공용
/articles/:id/comments       CommentPage           〃
/search                      SearchPage            (P1)
/archives                    ArchiveListPage       "전체보기" 목적지 (P1)
/schedules                   ScheduleListPage      (P1)

오버레이 (라우트 아님)
  LanguageSheet      헤더 언어 칩 → Bottom Sheet
  VoiceAssistant     MicFab / 배너 CTA → Bottom Sheet 4단계
```

---

## 2. 레이아웃 · 셸

| 코드 | Figma 노드 | 비고 |
|---|---|---|
| `layout/AppShell` | `2:204` 상단부 | 탭 3화면 공통. **이미 구현됨 — 토큰만 교체** |
| `layout/AppHeader` | `2:1202` | 로고 + 언어 칩 |
| `layout/AppHeaderBack` | `2:1209` | 뒤로가기 + 타이틀 |
| `layout/TabBar` | `2:207` | HOME / COMMUNITY / PLAY |
| `layout/BottomSheet` | `2:960` | 오버레이 컨테이너 |
| `layout/Dim` | `2:959` | 배경 딤 |

---

## 3. 공통 UI

| 코드 | Figma 노드 | 상태 |
|---|---|---|
| `ui/SearchBar` | `2:1254` / `2:1267` | Default / Active |
| `ui/InputField` | `2:1220` / `2:1224` | Default / Typing — 댓글 입력 |
| `ui/Chip` | `2:1229` / `2:1231` | Default / Selected |
| `ui/Toast` | `2:1234` / `2:1239` / `2:1246` | Success / Error / Info |
| `ui/Heart` | `2:1032` / `2:1036` | Default / Active — 좋아요 토글 |
| `ui/SectionHeader` | `I2:232;5:363` | 제목 + `전체보기 >` |
| `ui/StatusBadge` | `2:1229` 파생 | 모집 중 / 모집 완료 / 마감 |
| `ui/ProgressBar` | GatheringCard 내부 | 트랙 + 채움 |
| `ui/SubscribeButton` | `2:1145` | 구독 / 구독 중 |
| `ui/CountryBadge` | `Reply` 내부 | 국가 표시 |

---

## 4. 콘텐츠 카드 · 캐러셀

| 코드 | Figma 노드 | 치수 | 사용처 |
|---|---|---|---|
| `content/CarouselHorizontal` | `2:1089` | 260×236 | HOME 아카이브, PLAY 성지순례, 관련 콘텐츠 |
| `content/CarouselVertical` | `2:1040` | 164×189 2열 | HOME 모집 중 모임, PLAY 응원하기 |
| `content/ContentCard` | `I2:232;5:344` | 260×236 | 캐러셀 항목. 배지로 기사/영상/LIVE 분기 |
| `content/VideoCard` | `2:1115` | 375×303 | 관련 영상 리스트 |
| `content/GatheringCard` | `6:751` 내부 | 343×352 | COMMUNITY 세로 리스트 |

`ContentCard`는 **배지 타입에 따라 메타 표시가 달라집니다** — `design-spec.md` §2 화면1 참조.

---

## 5. 도메인 컴포넌트

| 코드 | Figma 노드 | 설명 |
|---|---|---|
| `ai/AiPanel` | `2:1066` | AI 분석 — 기사·영상 상세 공용 |
| `ai/VoiceAssistant` | `7:1432`~`7:1605` | 4단계 상태 머신 |
| `ai/VoiceMascot` | `7:1432` / `7:1548` | 마스코트 2포즈 |
| `ai/MicFab` | `2:234` | 진입 버튼 |
| `comment/Reply` | `2:994` | 아바타·국가·번역·하트 |
| `comment/CommentComposer` | `2:1220` | 하단 고정 입력창 |
| `video/VideoPlayer` | `2:1124` 상단 | 375×211 |
| `video/VideoMeta` | `2:1124` | 채널 + 구독 + 좋아요 + 공유 |
| `article/ArticleBody` | `6:267` | 섹션 본문 + 용어 하이라이트 툴팁 |
| `gathering/GatheringApplyBar` | `7:1923` 하단 | 진행률 + 참가 신청 버튼 |

---

## 6. 페이지 ↔ 노드

| 페이지 | 노드 | 조립 컴포넌트 |
|---|---|---|
| `HomePage` | `2:204` | AppShell · 일정카드 · CarouselHorizontal · CarouselVertical |
| `CommunityPage` | `6:751` | AppShell · SectionHeader · GatheringCard × N |
| `PlayPage` | `2:368` | AppShell · CarouselHorizontal · CarouselVertical |
| `GatheringDetailPage` | `7:1923` | HeaderBack · StatusBadge · 정보카드 · GatheringApplyBar |
| `ArticleDetailPage` | `6:267` | HeaderBack · AiPanel · ArticleBody · 댓글미리보기 · 캐러셀 ×2 |
| `VideoDetailPage` | `6:453` / `6:463` | HeaderBack · VideoPlayer · VideoMeta · AiPanel · 댓글미리보기 · VideoCard |
| `CommentPage` | `6:473` | HeaderBack · Reply × N · CommentComposer |
| `LanguageSheet` | `6:1056` | Dim · BottomSheet |

---

## 7. 재사용 판단

**셸 + 캐러셀 2종 + 카드 3종**이면 탭 3화면이 전부 조립됩니다. 여기가 이미 구현돼 있어
토큰 교체 + 실데이터 연결만 하면 됩니다.

순수 신규는 **도메인 컴포넌트 10개**이며, 이 중 `AiPanel`·`Reply`·`VoiceAssistant` 셋이
작업량의 대부분을 차지합니다.

---

## 8. 아이콘 확보

`get_design_context` 응답의 에셋 URL은 **7일 후 만료**됩니다.
아이콘을 손으로 그리지 말고 다운로드해 `FE/src/assets/icons/`에 커밋하세요.

```bash
curl -sL -o FE/src/assets/icons/magnifier.svg "<asset-url>"
```

크기는 컨테이너에 **width/height를 모두 명시**하고 `<img>`를 100%로 채웁니다.
`auto`를 쓰면 원본 크기로 튀어나옵니다.
