import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../api/client";
import { currentLocale } from "../../i18n";
import { formatRelativeTime } from "../../lib/format";
import AiSummaryCard from "./AiSummaryCard";
import styles from "./AiPanel.module.css";

/**
 * AI 분석 패널 (Figma 2:1066) — 기사 상세와 영상 상세 공용.
 *
 * **조회는 DB 읽기 한 번입니다.** 분석은 서버 기동 시 미리 생성돼 있어서 화면이 즉시 뜹니다
 * (docs/ai-stack.md §4). 아직 생성 전이면 404 가 오는데, 그때는 "준비 중"을 보여주고
 * 잠시 뒤 자동으로 다시 시도합니다.
 *
 * 언어를 바꾸면 쿼리 키가 바뀌어 해당 언어 분석을 다시 불러옵니다.
 */
export default function AiPanel({ contentId }: { contentId: number }) {
  const { t } = useTranslation();
  const locale = currentLocale();

  const { data, isError } = useQuery({
    queryKey: ["ai-analysis", contentId, locale],
    queryFn: () => api.getAiAnalysis(contentId),
    // 워밍업이 아직 이 콘텐츠에 도달하지 않았을 수 있어 몇 번 더 시도합니다.
    retry: 2,
    retryDelay: 3000,
  });

  if (isError || !data) {
    return <p className={styles.pending}>{t("ai.unavailable")}</p>;
  }

  // 생김새는 AiSummaryCard 가 담당합니다 — 모집 대화방 상단 패널과 같은 컴포넌트라
  // 여기서만 스타일을 손대면 두 화면이 서로 달라집니다.
  return (
    <AiSummaryCard
      title={t("ai.panelTitle")}
      time={formatRelativeTime(data.generatedAt)}
      summary={data.summary}
      items={data.items ?? []}
    />
  );
}
