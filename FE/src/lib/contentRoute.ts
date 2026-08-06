import type { ContentSummary } from "../api/client";

/**
 * 콘텐츠 상세 라우트.
 *
 * 라우트는 기사/영상으로 갈리지만 **서버 조회는 `/contents/{id}` 하나**입니다.
 * HOME 캐러셀이 둘을 섞어 보여주므로 카드가 타입에 따라 목적지를 정합니다.
 */
export function contentRoute(
  content: Pick<ContentSummary, "id" | "type">,
): string {
  return content.type === "ARTICLE"
    ? `/articles/${content.id}`
    : `/videos/${content.id}`;
}
