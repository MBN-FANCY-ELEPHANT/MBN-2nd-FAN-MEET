/**
 * 음성 명령 → 화면 이동.
 *
 * 주 사용자층이 중장년이라 **메뉴를 파고들지 않고 말로 바로 이동**할 수 있어야 합니다.
 * "모집 보여줘" 처럼 말하면 AI 에게 묻지 않고 곧장 해당 화면으로 갑니다.
 *
 * ⚠️ **이동 동사가 있을 때만** 명령으로 봅니다. `"콘서트가 언제야?"` 는 질문이지
 *    이동 요청이 아닌데, 키워드만 보면 공연 화면으로 튀어버립니다 — 실제로 위험한
 *    오작동이라 동사 + 대상이 모두 있을 때만 명령으로 처리합니다.
 *
 * ⚠️ LLM 을 쓰지 않는 **키워드 매칭**입니다. 왕복이 없어 즉시 반응하고 비용이 0 입니다.
 *    한국어·영어만 다룹니다 (데모 언어. `docs/ai-stack.md` §2 "데모는 ko/en").
 */

/** 이동 의사를 나타내는 표현. 하나라도 있어야 명령으로 봅니다. */
const NAVIGATION_VERBS = [
  "보여",
  "열어",
  "가줘",
  "가 줘",
  "이동",
  "보러",
  "보고 싶",
  "보고싶",
  "틀어",
  "볼래",
  "들어가",
  "화면",
  "페이지",
  "show",
  "open",
  "go to",
  "take me",
];

/** 대상 키워드 → 라우트. 위에서부터 먼저 맞는 것을 씁니다. */
const TARGETS: { route: string; labelKey: string; words: string[] }[] = [
  {
    route: "/feed",
    labelKey: "nav.feed",
    words: ["소식", "피드", "활동", "news", "feed"],
  },
  {
    route: "/broadcast",
    labelKey: "nav.broadcast",
    words: [
      "방송",
      "영상",
      "기사",
      "뉴스",
      "롱폼",
      "숏폼",
      "broadcast",
      "video",
    ],
  },
  {
    route: "/fanspace/gathering",
    labelKey: "fanspace.category.gathering",
    words: ["모집", "모임", "버스", "대절", "gathering", "meetup"],
  },
  {
    route: "/fanspace/concert",
    labelKey: "fanspace.category.concert",
    words: ["공연", "콘서트", "응모", "concert", "show"],
  },
  {
    route: "/fanspace/goods",
    labelKey: "fanspace.category.goods",
    words: ["굿즈", "상품", "응원봉", "goods", "merch"],
  },
  {
    route: "/fanspace/vote",
    labelKey: "fanspace.category.vote",
    words: ["투표", "vote"],
  },
  {
    route: "/search",
    labelKey: "search.title",
    words: ["검색", "찾아", "search", "find"],
  },
  {
    route: "/home",
    labelKey: "voice.commandHome",
    words: ["홈", "처음", "메인", "home", "main"],
  },
];

export type VoiceCommand = { route: string; labelKey: string };

/**
 * **기능 완료 요청**인지. 맞으면 화면 이동으로 가로채지 않고 서버로 보냅니다.
 *
 * ⚠️ 이 가드가 없으면 `"이찬원 무대 영상 보여줘"` 가 `"영상"` + `"보여"` 에 걸려
 *    **방송 화면으로 튀고**, 정작 무대 영상은 나오지 않습니다.
 *    `"버스 대절 신청해줘"` 도 `"버스"` 때문에 모집 목록으로 튑니다 — 신청은 안 되고요.
 *
 * ⚠️ 판정 어휘는 BE `VoiceActionResolver` 와 **같은 편**이어야 합니다. 한쪽만 넓히면
 *    여기서 가로채지 않았는데 서버도 액션으로 안 보는 사각지대가 생깁니다.
 */
const ACTION_HINTS = [
  // 요청형 — 이게 없으면 질문입니다 ("응모는 어떻게 해?" 로 응모가 걸리면 안 됩니다)
  "해줘",
  "해 줘",
  "해주세요",
  "해 주세요",
  "하고 싶",
  "하고싶",
  "신청해",
  "응모해",
  "참여해",
  "참가해",
  "넣어줘",
  "sign me up",
  "for me",
  // 취소도 기능 완료 요청입니다 — "공연 응모 취소해줘" 가 공연 목록으로 튀면 안 됩니다
  "취소해",
  "취소 해",
  "취소할",
  "취소하고 싶",
  "취소하고싶",
  "cancel",
];

/** 무대 영상은 "보여줘" 계열이 요청형이라 별도로 봅니다. */
const STAGE_HINTS = ["무대", "직캠", "스테이지", "stage", "performance"];

export function isActionRequest(text: string): boolean {
  const said = text.toLowerCase();
  if (STAGE_HINTS.some((word) => said.includes(word))) return true;
  return ACTION_HINTS.some((hint) => said.includes(hint));
}

/**
 * 이동 명령이면 대상을, 아니면 null (=AI 에게 질문).
 *
 * @param afterFeatureAnswer 직전 답변이 **기능 안내**였는지. true 면 이동 동사를
 *   요구하지 않습니다 — 도우미가 "공연, 모집을 도와드릴 수 있어요"라고 말한 직후에는
 *   사용자가 그냥 **"공연"** 한 단어만 말하는 게 자연스럽기 때문입니다.
 *   평소에 이 조건을 풀면 `"콘서트가 언제야?"` 가 공연 화면으로 튑니다.
 */
export function matchVoiceCommand(
  text: string,
  afterFeatureAnswer = false,
): VoiceCommand | null {
  // 기능 완료 요청은 화면 이동이 아닙니다 — 서버가 실행해야 합니다 (isActionRequest 주석).
  if (isActionRequest(text)) return null;

  const said = text.toLowerCase();
  const hasVerb = NAVIGATION_VERBS.some((verb) => said.includes(verb));
  if (!hasVerb && !afterFeatureAnswer) return null;

  const hit = TARGETS.find((target) =>
    target.words.some((word) => said.includes(word)),
  );
  return hit ? { route: hit.route, labelKey: hit.labelKey } : null;
}
