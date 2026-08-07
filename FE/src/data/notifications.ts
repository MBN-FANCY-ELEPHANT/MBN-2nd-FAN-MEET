/**
 * 알림 목록 — **임시 정적 데이터**.
 *
 * ⚠️ BE 에 알림·관심 키워드 도메인이 없습니다 (개편 3단계에서 계약 추가).
 *    문구는 7개 언어를 태워야 하므로 i18n 키로 들고 있습니다.
 */
export type AppNotification = {
  id: number;
  messageKey: string;
  params?: Record<string, string>;
};

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    messageKey: "notification.sample.keywordVideo",
    params: { keyword: "진이" },
  },
  {
    id: 2,
    messageKey: "notification.sample.gatheringJoined",
    params: { title: "경상남도 차량 대절" },
  },
];
