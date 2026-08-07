/**
 * 모집 참여자 단체 대화방의 **예시 대화** — 임시 정적 데이터.
 *
 * ⚠️ **BE 에 모임 채팅 도메인이 없습니다.** 실시간 채팅은 `docs/mvp-scope.md` 컷 목록에
 *    있고, 개편 결정 로그도 "모집 채팅은 AI 단독 응답 — 폴링·실시간 통신 없이 **채팅의
 *    형식만** 보여준다" 로 확정돼 있습니다. 그래서 참여자 말풍선은 정적 예시이고,
 *    실제로 답하는 것은 **AI 도우미 비엔이** 뿐입니다.
 *
 * ⚠️ 화면에 **예시 대화라는 표기를 반드시 남기세요**(`gatheringChat.sampleNotice`).
 *    다른 팬이 실제로 쓴 말처럼 보이면 안 됩니다.
 *
 * ⚠️ 닉네임은 `fanIdentity.ts` 의 룰렛 후보와 같은 어법(동물 이름)입니다. 실제 사용자
 *    이름을 쓰지 마세요.
 *
 * 모임 종류(`BUS` / `DONATION`)별로 대화 내용이 다릅니다 — 버스 대절방에서 기부 이야기가
 * 나오면 데모에서 바로 어색합니다.
 */

export type GatheringChatMessage = {
  id: number;
  nickname: string;
  /** 발화 시각 표시용. 상대시각으로 계산하지 않고 그대로 씁니다 (정적 예시라서) */
  at: string;
  body: string;
};

const BUS_SAMPLE: GatheringChatMessage[] = [
  {
    id: 1,
    nickname: "부엉이",
    at: "09:12",
    body: "안녕하세요! 이번에 처음 참여해요. 잘 부탁드립니다 :)",
  },
  {
    id: 2,
    nickname: "다람쥐",
    at: "09:20",
    body: "저도요~ 집결지 근처에 주차 가능한 곳 있을까요?",
  },
  {
    id: 3,
    nickname: "고슴도치",
    at: "09:31",
    body: "역 공영주차장 쓰시면 됩니다. 종일권이 제일 싸요.",
  },
  {
    id: 4,
    nickname: "펭귄",
    at: "10:02",
    body: "출발 시간에 늦으면 안 되니까 30분 전에는 모이는 걸로 해요!",
  },
];

const DONATION_SAMPLE: GatheringChatMessage[] = [
  {
    id: 1,
    nickname: "코끼리",
    at: "11:05",
    body: "모금 참여했습니다! 좋은 일에 함께해서 기뻐요.",
  },
  {
    id: 2,
    nickname: "토끼",
    at: "11:24",
    body: "기부 영수증은 언제쯤 나오나요?",
  },
  {
    id: 3,
    nickname: "수달",
    at: "11:40",
    body: "모금 종료 후에 내역이랑 같이 공개된다고 공지에 있었어요.",
  },
];

/** 모임 종류에 맞는 예시 대화. 모르는 종류면 버스 쪽을 씁니다. */
export function sampleChat(type: string | undefined): GatheringChatMessage[] {
  return type === "DONATION" ? DONATION_SAMPLE : BUS_SAMPLE;
}
