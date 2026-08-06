# 디자인 토큰 (Figma 확정본 실측)

Figma `fileKey: 71R3xxvzqYiDB6vjpfZUKR` 에서 `get_design_context`로 추출한 **실측값**입니다.
추정치가 아닙니다. 구현체는 `FE/src/styles/tokens.css`.

**최종 갱신:** 2026-08-06 · 와이어프레임 추정치 → Figma 실측값으로 전면 교체

---

## 1. 레이아웃 — 375px 모바일

| 토큰 | 값 | 비고 |
|---|---|---|
| `--app-width` | `375px` | 디자인 캔버스 폭 (기존 430px에서 변경) |
| `--page-padding-x` | `16px` | 좌우 여백 → 콘텐츠 폭 `343px` |
| `--header-height` | `45px` | px16 py10 |
| `--tabbar-height` | `27px` | top `58px` |

세로 좌표(디자인 절대값):

```
0     Header
58    TabBar          (h 27, 각 탭 125px)
97    SearchBar       (h 56)
173   StarGreeting    (h 51)
244   HeroBanner      (h 160)
432   BottomSheet     (radius-top 24)
```

데스크톱 레이아웃은 존재하지 않습니다. 데스크톱에서는 375px 캔버스를 중앙 정렬합니다.

---

## 2. 컬러

### Figma 변수 (디자이너가 등록한 6개 — 이것이 정본)

```css
--color-primary:        #F58220;   /* Color/Primary */
--color-background:     #F8FAFC;   /* Color/Background */
--color-divider:        #E2E8F0;   /* Color/Divider */
--color-white:          #FFFFFF;   /* Color/White */
--color-text-primary:   #111827;   /* Color/Text Primary */
--color-text-secondary: #737373;   /* Color/Text Secondary */
```

### 변수 미등록 — 디자인에서 실측한 값

```css
--color-surface-muted:  #F9FAFB;   /* "다가오는 일정" 카드 배경 */
--color-overlay-badge:  rgba(0,0,0,0.6);   /* 카드 위 기사/영상 배지 */
--color-dim:            rgba(0,0,0,0.4);   /* Bottom Sheet 뒤 DIM */

/* AI 계열 — 인디고. AI 분석 패널·음성 답변 카드에 공통 사용 */
--color-ai-border:      #6366F1;
--color-ai-surface:     #EEF0FD;
--color-ai-text:        #4F46E5;

/* 상태 */
--color-success:        #16A34A;
--color-danger:         #DC2626;
--color-toast-bg:       #111827;   /* Toast 다크 배경 */
```

### 페이지 배경 — 대각선 그라데이션

탭 3화면의 배경입니다. 세로 그라데이션이 아니라 **대각선(-56.9°)** 입니다.

```css
--gradient-page: linear-gradient(-56.9deg, #FFFFFF 17.46%, #FFE8D6 98.18%);
```

**배너는 그라데이션이 아니라 단색** `--color-primary` 입니다. (1차 문서의 그라데이션 배너는 폐기)

---

## 3. 타이포그래피

**Pretendard** 단일 서체. Bold / Medium / Regular 세 가지 웨이트만 사용합니다.

```css
--font-family: "Pretendard Variable", Pretendard, -apple-system,
               "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
```

| 토큰 | size / weight / line-height | 용도 |
|---|---|---|
| `--text-logo` | 20 / Bold / normal | `MBN AI` |
| `--text-h1` | 22 / Bold / normal | `임영웅 님과의 팬덤 공간` |
| `--text-section` | 20 / Bold / 1.4 | 섹션 제목 (`아카이브`, `성지순례`) |
| `--text-banner-cta` | 20 / Bold / normal | `AI 매니저와 대화하기` |
| `--text-tab` | 16 / Bold(활성)·Regular(비활성) / normal | HOME / COMMUNITY / PLAY |
| `--text-card-title` | 16 / Medium / 1.4 | 카드 제목 |
| `--text-emphasis` | 16 / Bold / normal | 일정 날짜·제목 |
| `--text-search` | 18 / Medium / normal | 검색바 placeholder |
| `--text-body` | 14 / Medium / normal | 인사 문구, 배너 서브카피 |
| `--text-meta` | 14 / Regular / 1.4 | `MBN NEWS`, `1시간 전`, `전체보기` |
| `--text-label` | 13 / Medium / normal | `다가오는 일정` |
| `--text-caption` | 12 / Medium / 1.4 | 배지, 언어 칩 |

---

## 4. 반경 · 그림자 · 간격

```css
--radius-xs:    4px;    /* 카드 위 오버레이 배지 */
--radius-sm:    8px;    /* 언어 칩 */
--radius-md:   12px;    /* 카드 전반 */
--radius-lg:   16px;    /* 검색바, 배너 */
--radius-xl:   24px;    /* Bottom Sheet 상단 */
--radius-pill: 999px;   /* MicFab, 상태 배지 */

--shadow-card:   0 4px 8px rgba(0,0,0,0.06);      /* 가로 캐러셀 카드 */
--shadow-grid:   0 4px 4px rgba(0,0,0,0.06);      /* 2열 그리드 카드 (drop-shadow) */
--shadow-sheet:  0 -4px 16px rgba(0,0,0,0.04);    /* Bottom Sheet 위로 */
--shadow-fab:    0 4px 16px rgba(245,130,32,0.25);/* MicFab */

--space-1:  4px;   --space-2:  8px;   --space-3: 12px;
--space-4: 16px;   --space-5: 20px;   --space-6: 24px;
```

---

## 5. 컴포넌트 실측 스펙

### Header (`2:205`)

```
w 375, px 16, py 10
  좌: "MBN AI"        20px Bold  #111827
  우: 언어 칩          h 25, radius 8, px 12, gap 4
      bg #F8FAFC, border 1px #E2E8F0
      아이콘 16px + 텍스트 12px Medium #111827
```

### TabBar (`2:207`)

```
w 375, h 27, 탭 3개 × 125px
  활성:   16px Bold    #F58220  + 밑줄 47×3 radius 2 (#F58220)
  비활성: 16px Regular #737373
  하단 구분선 1px 전체 폭
```

### SearchBar (`2:206`)

```
w 343, h 56, radius 16
bg #FFFFFF, border 1px #E2E8F0
px 16, py 10, gap 8
  아이콘 24px + placeholder 18px Medium #737373
```

### HeroBanner (`2:221`)

```
w 343, h 160, radius 16
bg #F58220 (단색)
텍스트 left 21, top 55, gap 8, 색상 white
  서브카피 14px Medium
  CTA      20px Bold
```

### BottomSheet (`2:225`)

```
w 375, top 432
bg #FFFFFF, radius-top 24, border-top 1px #E2E8F0
shadow 0 -4px 16px rgba(0,0,0,0.04)
px 20, py 12, gap 16
```

### 다가오는 일정 카드 (`2:226`)

```
w 343, radius 12, bg #F9FAFB, p 16, gap 8
  라벨   13px Medium #737373
  날짜   16px Bold   #F58220      ┐ gap 12
  제목   16px Bold   #111827      ┘
```

### 섹션 헤더 (캐러셀 공통)

```
제목      20px Bold   #111827  lh 1.4
전체보기  14px Medium #737373  + 화살표 아이콘 24px, gap 4
```

### 가로 캐러셀 카드 (`Carousal (Horizontal)`)

```
w 260, h 236, radius 12, bg #FFFFFF, shadow-card
  이미지  h 146, radius-top 12
  배지    left 8 top 8, bg rgba(0,0,0,0.6), px 10 py 4, radius 4
          12px Medium white  ("기사" / "영상" / "LIVE")
  본문    left 12, top 156, w 236, gap 6
    제목   16px Medium #111827 lh 1.4
    메타   14px Regular #737373  (좌/우 양끝 정렬)
카드 간격 16px
```

### 2열 그리드 카드 (`Carousal (Vertical)`)

```
w 164, h 189, radius 12, bg #FFFFFF, drop-shadow-grid, gap 10
  이미지 h 123, radius-top 12
  제목   px 12, w 140, 16px Medium #111827 lh 1.4
그리드 간격 15px
```

### MicFab (`2:234`)

```
size 64, radius 999, bg #F58220
shadow 0 4px 16px rgba(245,130,32,0.25)
아이콘 32px 중앙
위치: 우측 하단 고정 (디자인 절대좌표 left 287)
```

### GatheringCard 세로형 (COMMUNITY)

```
w 343, h 352, radius 12, bg #FFFFFF
  이미지     h 193, radius-top 12
  본문 영역  p 16
    상태 배지  h 25, radius 8, px 8, 12px Medium
    제목       16px Bold
    내용       14px Regular #737373, 1줄 clamp
    진행 라벨  14px Regular #737373 (우측 정렬)
    진행바     h 6, radius 999
               트랙 #E2E8F0 / 채움 #F58220
    호스트     14px Regular #737373 (좌)
    마감일     14px Regular #737373 (우)
```

### 상태 배지 (Figma 7:1929 실측)

```
px 8 / py 4 / radius 4 / 12px Bold / line-height 1.4
```

| 상태 | 라벨 | 배경 | 텍스트 |
|---|---|---|---|
| `RECRUITING` | 모집 중 | `--color-primary` | white |
| `FULL` | 모집 완료 | `--color-text-secondary` | white |
| `CLOSED` | 마감 | `--color-divider` | `--color-text-secondary` |

### 진행바 (Figma 7:1961 실측)

```
h 6 / radius 999
트랙  --color-progress-track (#EEF2FF)  ← 회색이 아니라 인디고 계열입니다
채움  --color-primary
```

### 모임 상세 하단 (Figma 7:1958~1964)

```
진행률 라벨  13px SemiBold #737373, 우측 정렬
진행바       위와 동일, 라벨과 gap 6
CTA 버튼     h 56, radius 12, bg primary, 22px Bold white
진행률 ↔ CTA gap 16
```

### AI 패널 (`AI Pannal` `2:1066`) — 실측

```
w 343, radius 16, p 20, bg #FFFFFF
border 2px #6366F1              ← 1px 이 아니라 2px 입니다
  헤더    아이콘 24 + gap 8 + "AI 분석" 14px Bold #6366F1
          우측 생성시각 14px Regular #737373
  구분선  1px #E2E8F0, 위아래 여백 16
  요약    bg rgba(99,102,241,0.1), px 16 py 12, radius 8
          14px Medium #111827
  항목    gap 16, 각 항목 내부 gap 4
          제목 14px Medium #737373 / 내용 16px Bold #111827
```

### 댓글 (`Reply` `2:994`) — 실측

```
p 16, border-bottom 1px #E2E8F0, 내부 gap 12
  아바타    40 원형, 닉네임과 gap 8
  닉네임    16px Medium #111827
  국가 배지 h 20, radius 8, px 8, bg #F8FAFC, 12px Medium #737373
  작성시각  14px Regular #737373 (우측)
  본문      16px Regular lh 1.5 #111827
  번역 아이콘 18 (터치 타깃은 44 로 확장)
  하트      아이콘 24 + gap 4 + 14px SemiBold
            비활성 #737373 / 활성 #F58220
```

### Toast (`2:1233`)

```
w 178, h 56, radius 12, bg --color-toast-bg
아이콘 24px + 텍스트 14px Medium
  Success 흰색 체크
  Error   오렌지 경고 + 오렌지 텍스트
  Info    흰색 i
```

### Chip (`2:1228`)

```
w 98, h 48, radius 999
  Default  bg white,  border #E2E8F0, 텍스트 #111827
  Selected bg #F58220, 텍스트 white
```

### Reply (댓글) (`2:994`)

```
아바타 40px 원형
닉네임 14px Bold + 국가 배지(bg #F1F5F9, radius 4, px 6, 12px)
작성시각 우측 14px Regular #737373
본문 14px Regular + 번역 아이콘 16px
하트: 미선택 빈하트 #737373 / 선택 채운하트 #F58220 + 카운트 14px Bold
```

---

## 6. 접근성

- **진행바는 색만으로 정보를 전달하지 않습니다.** `34/40` 텍스트를 항상 함께 노출합니다.
- 배너 CTA는 `white on #F58220` — 대비비 약 2.9:1로 **AA 미달**입니다.
  20px Bold(대형 텍스트) 기준 3:1에 근접하나 여유가 없으므로, 실제 렌더 후 재측정하고
  미달이면 배너 배경을 `#E4741A`로 한 단계 어둡게 조정하세요.
- 모든 터치 타깃 최소 44px. 하트·번역 아이콘은 시각적으로 16~24px이므로
  **투명 패딩으로 히트 영역을 44px까지 확장**해야 합니다.
- 음성 화면은 마이크 권한 거부 시 텍스트 입력 폴백이 필수입니다 (`ai-stack.md` §2).

---

## 7. 아이콘 · 이미지 — ✅ 확보 완료

아이콘 세트는 **Neaticons** + **mingcute**(마이크)입니다.
`FE/src/assets/icons/` 에 실제 SVG 를 커밋해 뒀고, `components/ui/Icon.tsx` 로 씁니다.

> ⚠️ **아이콘을 직접 `<svg>` 로 그리지 마세요.** 원본 벡터가 없으므로 손으로 그린 것은
> 반드시 디자인과 달라집니다. `get_design_context` 의 에셋 URL 은 **7일 후 만료**되니
> 새 아이콘이 필요하면 그때 받아서 커밋하세요.

| 파일 | 용도 |
|---|---|
| `magnifier.svg` | 검색바 |
| `earth.svg` | 언어 칩 |
| `arrow-left.svg` | Header (Back) |
| `mic.svg` | MicFab · 음성 오버레이 |
| `calendar.svg` · `map-marker.svg` · `wallet.svg` | 모임 상세 정보 카드 |
| `ai-square.svg` | AI 분석 패널 |
| `heart.svg` | 좋아요 (콘텐츠·댓글) |
| `translate.svg` | 댓글 번역 |

검정 벡터를 오렌지 배경 위에 올릴 때는 `filter: brightness(0) invert(1)` 로 흰색 반전합니다.
활성 상태(좋아요·번역)는 `filter` 로 브랜드 오렌지로 물들입니다.

마스코트("비엔이") 일러스트는 **상태별 2종**이 필요합니다 — 마이크 든 모습 / 돋보기+태블릿 든 모습.
COMMUNITY 배너에도 별도 포즈가 들어갑니다.
