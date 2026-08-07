/**
 * 모집 참여자 단체 대화방의 **예시 대화** — 임시 정적 데이터.
 *
 * ⚠️ **BE 에 모임 채팅 도메인이 없습니다.** 실시간 채팅은 `docs/mvp-scope.md` 컷 목록에
 *    있고, 개편 결정 로그도 "모집 채팅은 AI 단독 응답 — 폴링·실시간 통신 없이 **채팅의
 *    형식만** 보여준다" 로 확정돼 있습니다. 그래서 참여자 말풍선은 정적 예시이고,
 *    실제로 답하는 것은 **AI 도우미 비엔이** 뿐입니다.
 *
 * ⚠️ **대화 내용과 상단 AI 요약은 같은 주제를 다뤄야 합니다.**
 *    화면 상단 AI 패널(Figma `27:6525` "AI Pannal")이 "톡방을 분석한 내용" 으로 요약을
 *    보여주는데, 그 요약은 `GatheringChatPage.summaryItems()` 가 **모임의 실제 DB 값**
 *    (집결지·행사일·참가비·인원·공지)으로 만듭니다. 여기 대화가 딴 얘기를 하면
 *    요약이 대화를 요약한 것처럼 보이지 않습니다.
 *      - `BUS`      → 출발 시각·집결 장소·이동 경로·복귀
 *      - `DONATION` → 기부처·모금 규모·내역 공개
 *
 * ⚠️ 닉네임은 `fanIdentity` 룰렛과 같은 어법(동물 이름)입니다. 실제 사용자 이름을 쓰지 마세요.
 */

export type GatheringChatMessage = {
  id: number;
  nickname: string;
  /** 발화 시각 표시용. 상대시각으로 계산하지 않고 그대로 씁니다 (정적 예시라서) */
  at: string;
  body: string;
};

/** 버스 대절 — 출발 시각 · 집결 장소 · 이동 경로 · 복귀 */
const BUS_SAMPLE: GatheringChatMessage[] = [
  {
    id: 1,
    nickname: "부엉이",
    at: "09:12",
    body: "이번에 처음 참여해요! 집결 장소랑 시간이 어떻게 되나요?",
  },
  {
    id: 2,
    nickname: "고슴도치",
    at: "09:20",
    body: "출발 30분 전까지는 오셔야 해요. 늦으면 버스가 먼저 출발합니다.",
  },
  {
    id: 3,
    nickname: "다람쥐",
    at: "09:31",
    body: "공연장까지는 얼마나 걸릴까요? 근처에 주차할 곳도 있나요?",
  },
  {
    id: 4,
    nickname: "펭귄",
    at: "10:02",
    body: "막히지 않으면 두 시간 반쯤이요. 역 공영주차장 종일권이 제일 쌉니다.",
  },
  {
    id: 5,
    nickname: "고슴도치",
    at: "10:15",
    body: "공연 끝나면 같은 자리에서 모여서 함께 돌아옵니다.",
  },
];

/** 기부금 모금 — 기부처 · 모금 규모 · 내역 공개 */
const DONATION_SAMPLE: GatheringChatMessage[] = [
  {
    id: 1,
    nickname: "코끼리",
    at: "11:05",
    body: "이번 모금은 어디로 전달되나요?",
  },
  {
    id: 2,
    nickname: "토끼",
    at: "11:24",
    body: "팬덤 이름으로 전달된다고 공지에 있었어요. 좋은 일에 함께해서 기뻐요.",
  },
  {
    id: 3,
    nickname: "수달",
    at: "11:40",
    body: "최소 금액보다 더 내도 되나요? 목표까지 얼마나 남았을까요?",
  },
  {
    id: 4,
    nickname: "햄스터",
    at: "11:52",
    body: "금액은 자유예요. 지금 절반 조금 넘게 모인 걸로 알고 있어요.",
  },
  {
    id: 5,
    nickname: "토끼",
    at: "12:08",
    body: "모금 내역이랑 기부 영수증은 종료 후에 전체 공개된대요.",
  },
];

/** 모임 종류에 맞는 예시 대화. 모르는 종류면 버스 쪽을 씁니다. */
export function sampleChat(type: string | undefined): GatheringChatMessage[] {
  return type === "DONATION" ? DONATION_SAMPLE : BUS_SAMPLE;
}
