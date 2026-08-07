import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import ContentCard from "../components/content/ContentCard";
import ShortformCard from "../components/content/ShortformCard";
import Section from "../components/ui/Section";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";

/**
 * 방송 탭 (Figma 19:3203 / 19:3444).
 *
 * 두 캐러셀입니다:
 *  - **기사&롱폼** — `Carousal (Horizontal)` (2:1089). 기존 `ContentCard` 그대로 재사용
 *  - **숏폼** — `Carousal (LIVE)`. 세로 플레이어 상세는 아직 없습니다
 *
 * ⚠️ 숏폼은 BE 에 타입이 없습니다. `Content.type` 에 `SHORTFORM` 을 추가할지,
 *    별도 도메인으로 뺄지 개편 2단계에서 정하세요. 지금은 **영상 콘텐츠를 그대로**
 *    숏폼 자리에 보여줍니다 — 레이아웃 확인용입니다.
 */
export default function BroadcastPage() {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home", STAR_ID],
    queryFn: () => api.getHome(STAR_ID),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const contents = data.contents ?? [];
  // 기사&롱폼은 LIVE 를 빼고 보여줍니다 — LIVE 는 아래 숏폼 캐러셀의 몫입니다
  const articlesAndLongform = contents.filter((content) => !content.live);
  const shortform = contents.filter(
    (content) => content.type === "VIDEO" || content.live,
  );

  return (
    <>
      <Section title={t("broadcast.articlesAndLongform")} seeAllTo="/contents">
        {articlesAndLongform.length === 0 ? (
          <EmptyState message={t("list.empty")} />
        ) : (
          <div className="scroll-x">
            {articlesAndLongform.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </Section>

      <Section
        title={t("broadcast.shortform")}
        seeAllTo="/contents?tab=longform"
      >
        {shortform.length === 0 ? (
          <EmptyState message={t("list.empty")} />
        ) : (
          <div className="scroll-x">
            {shortform.map((content) => (
              <ShortformCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
