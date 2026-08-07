import type { ChatAction } from "../../api/client";

/**
 * 액션 결과 → 사용자에게 보여줄 i18n 키.
 *
 * ⚠️ **확인 문구를 서버가 만들지 않는 것은 의도된 설계입니다.** 서버가 문장을 내려주면
 *    번역이 BE 와 FE 두 군데로 갈라지는데 이 앱은 7개 언어를 씁니다. 서버는 `type` 과
 *    `status` 만 주고 문장은 여기서 만듭니다 (docs/api-spec.yaml ChatAction).
 *
 * 음성 오버레이와 모집 채팅방이 **함께 씁니다** — 한쪽에만 고치면 같은 액션이 화면마다
 * 다르게 안내됩니다.
 */
export const ACTION_KEY: Record<ChatAction["type"], string> = {
  CONCERT_ENTRY: "concertEntry",
  CONCERT_ENTRY_CANCEL: "concertEntryCancel",
  GATHERING_JOIN: "gatheringJoin",
  GATHERING_CANCEL: "gatheringCancel",
  STAGE_VIDEO: "stageVideo",
};

export function actionMessageKey(action: ChatAction): string {
  const status = action.status
    .toLowerCase()
    .replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  return `voice.action.${ACTION_KEY[action.type]}.${status}`;
}

/** 실행 결과의 성패 → 토스트 종류. 실패도 "안내"라서 화면을 막지 않습니다. */
export function actionToastKind(status: ChatAction["status"]) {
  if (status === "DONE") return "success" as const;
  if (status === "ALREADY" || status === "FOUND") return "info" as const;
  return "error" as const;
}
