import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import PlaceCard from "../components/play/PlaceCard";
import TipCard from "../components/play/TipCard";
import Section from "../components/ui/Section";
import { ErrorState, LoadingState } from "../components/ui/States";

/**
 * PLAY 탭 (Figma 2:368).
 *
 * 섹션명은 디자인 명칭을 따릅니다 — 성지순례(Place) / 응원하기(Tip).
 * 두 섹션이 `getPlay` 한 번에 옵니다.
 */
export default function PlayPage() {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["play", STAR_ID],
    queryFn: () => api.getPlay(STAR_ID),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <>
      <Section title={t("play.pilgrimage")} seeAllTo="/play/places">
        <div className="scroll-x">
          {data.places?.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </Section>

      <Section title={t("play.cheer")} seeAllTo="/play/tips">
        <div className="grid-2">
          {data.tips?.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
      </Section>
    </>
  );
}
