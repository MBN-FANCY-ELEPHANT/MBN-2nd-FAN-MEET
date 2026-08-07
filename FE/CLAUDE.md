# FE — React 19 + TypeScript 6 + Vite 8

루트 `CLAUDE.md`의 규칙이 먼저 적용됩니다. 여기는 프론트엔드 전용 규약입니다.

## 디렉토리

```
src/
  api/         client.ts (fetch 래퍼 + 엔드포인트), schema.d.ts (자동 생성, gitignore)
  app/         App.tsx (라우팅 22개 + STAR_ID)
  components/
    layout/    AppHeader / HeaderBack / BottomNav / NotificationDrawer / LanguageSheet
    live/      LiveBanner + useYouTubePlayer (YouTube IFrame API)
    ui/        Section, Toast, States 등 재사용 프리미티브
  features/
    artist/    선택 아티스트 (localStorage) + 시드 이름 치환
    auth/      닉네임 룰렛(로그인 대체) · 간이 로그인
    voice/     VoiceAssistant(5단계) · VoiceStages(이펙트) · STT/TTS 훅
    concert/   공연 응모 상태 (localStorage)
    notification/ 알림 키워드 (localStorage)
  pages/       라우트별 화면 — 목록은 docs/worklog-fe.md §0
  data/        BE 계약이 없는 구간의 정적 더미 (feed / goods / live / programs)
  i18n/        index.ts + locales/{ko,en,fr,ja,es,zh,ru}.json
  styles/      tokens.css (디자인 토큰) + global.css
  lib/         format.ts (조회수·상대시각·재생시간)
```

⚠️ `pages/HomePage.tsx` · `CommunityPage.tsx` · `PlayPage.tsx` · `ui/Skeleton.tsx` 는
**죽은 파일**입니다 (라우팅 안 됨). `HomePage` 는 없는 경로로 링크해 이미 깨져 있으니
참고용으로도 믿지 마세요.

## 스타일링

**CSS Modules + CSS 변수.** Tailwind나 CSS-in-JS를 도입하지 마세요.

- 색상·간격·폰트는 **반드시 `src/styles/tokens.css`의 변수**를 참조합니다. 하드코딩 금지.
  Figma 확정본이 나오면 토큰 값만 교체해서 전체에 반영하는 것이 목표입니다.
- 컴포넌트별 스타일은 `Component.module.css`로 같은 폴더에 둡니다.
- 토큰에 없는 값이 필요하면 컴포넌트에 하드코딩하지 말고 `tokens.css`에 토큰을 추가한 뒤
  `docs/design-tokens.md`도 함께 갱신하세요.

## 레이아웃 전제

와이어프레임 3종이 **모두 375px 모바일**입니다. `#root`는 `max-width: 430px`로 중앙 정렬된
모바일 캔버스입니다. **데스크톱 전용 레이아웃은 MVP 범위 밖**이니 미디어 쿼리로 분기하지 마세요.

## 데이터 페칭

- 서버 상태는 **TanStack Query**로만 다룹니다. `useEffect` + `useState` 수동 페칭 금지.
- 호출은 `src/api/client.ts`의 `api.*`를 경유합니다. 컴포넌트에서 `fetch`를 직접 부르지 마세요.
- 응답 타입은 `schema.d.ts`에서 파생합니다 (`client.ts`의 `Json<...>` 별칭 참고).
  타입을 손으로 정의하면 계약과 어긋납니다.

## i18n

- 사용자에게 보이는 문자열은 전부 `t('key')`. **7개 로케일 파일 전부**에 추가합니다
  (`ko` `en` `fr` `ja` `es` `zh` `ru`). 번역 검수는 ko/en 만 합니다.
- 한쪽에만 키를 추가하면 언어 전환 시 키 문자열이 그대로 노출됩니다 — 데모 중 가장 눈에 띄는 사고입니다.
- 스타 이름 같은 동적 값은 보간을 씁니다: `t('star.fandomSpace', { name })`
- **국가명·통화 같은 것도 예외가 아닙니다.** 한때 댓글 국가 배지가 한글로 굳어 있어
  영어로 바꿔도 "미국·일본"이 그대로 남았습니다. 글로벌이 주제인데 가장 아픈 자리였습니다.

키 정합성은 커밋 전에 확인하세요:

```bash
cd FE && python scripts/check-i18n.py   # PARITY OK 를 눈으로 확인
```

## TypeScript

`erasableSyntaxOnly`가 켜져 있습니다. 아래 문법은 **컴파일 에러**입니다.

```ts
// ❌ 생성자 파라미터 프로퍼티
class A { constructor(readonly x: number) {} }
// ✅
class A { readonly x: number; constructor(x: number) { this.x = x; } }

// ❌ enum        → ✅ as const 객체 + union 타입
// ❌ namespace   → ✅ 모듈
```

`any` 금지. 타입을 모르겠으면 `unknown`으로 두고 좁히세요.

## 검증

```bash
npm run build   # tsc -b + vite build — 커밋 전 반드시 통과
npm run lint    # oxlint
npm run format  # prettier
```
