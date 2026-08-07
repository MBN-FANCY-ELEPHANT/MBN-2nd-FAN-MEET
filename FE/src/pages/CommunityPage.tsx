import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../api/client";
import { getSelectedStarId } from "../features/artist/selectedArtist";
import GatheringCard from "../components/gathering/GatheringCard";
import Section from "../components/ui/Section";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";

/**
 * COMMUNITY 탭 (Figma 6:751).
 *
 * 디자인상 이 탭은 **오프라인 모임 전용**입니다 — 게시판 화면은 존재하지 않습니다
 * (docs/design-spec.md §2 화면8).
 *
 * HOME 이 추천 4건을 보여주는 것과 달리 여기는 **전체 리스트**입니다. 모집 완료·마감 건도
 * 함께 보여줘야 팬덤이 얼마나 활발한지 전달됩니다.
 */
export default function CommunityPage() {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["gatherings", getSelectedStarId()],
    queryFn: () => api.getGatherings({ starId: getSelectedStarId(), size: 20 }),
  });

  return (
    <Section title={t("community.offlineGatherings")}>
      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && data.content?.length === 0 && (
        <EmptyState message={t("home.noSchedule")} />
      )}

      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        {data?.content?.map((gathering) => (
          <GatheringCard key={gathering.id} gathering={gathering} />
        ))}
      </div>
    </Section>
  );
}
