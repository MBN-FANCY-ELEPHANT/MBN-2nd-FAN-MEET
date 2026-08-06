import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import ContentCard from "../components/content/ContentCard";
import { GatheringGridCard } from "../components/gathering/GatheringCard";
import Section from "../components/ui/Section";
import { ErrorState, LoadingState } from "../components/ui/States";
import { formatDate } from "../lib/format";
import styles from "./HomePage.module.css";

/**
 * HOME 탭 (Figma 2:204).
 *
 * 세 섹션 데이터가 `getHome` 한 번에 옵니다 — 화면 하나 그리려고 4번 왕복하지 않도록
 * BE 가 집계해서 내려줍니다.
 *
 * ⚠️ `contents` 는 기사·영상이 **섞여서** 옵니다. 카드가 `type`/`live` 로 알아서 분기합니다
 * (docs/design-spec.md §2 화면1).
 */
export default function HomePage() {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home", STAR_ID],
    queryFn: () => api.getHome(STAR_ID),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const schedule = data.upcomingSchedule;

  return (
    <>
      <Section title={t("home.upcomingSchedule")}>
        {schedule ? (
          <div className={styles.schedule}>
            <p className={styles.scheduleLabel}>{t("home.upcomingSchedule")}</p>
            <div className={styles.scheduleRow}>
              <span className={styles.scheduleDate}>
                {formatDate(schedule.startAt)}
              </span>
              <span className={styles.scheduleTitle}>{schedule.title}</span>
            </div>
          </div>
        ) : (
          <div className={styles.schedule}>
            <p className={styles.scheduleLabel}>{t("home.noSchedule")}</p>
          </div>
        )}
      </Section>

      <Section title={t("home.archive")} seeAllTo="/contents">
        <div className="scroll-x">
          {data.contents?.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </Section>

      <Section title={t("home.recruitingGatherings")} seeAllTo="/community">
        <div className="grid-2">
          {data.gatherings?.map((gathering) => (
            <GatheringGridCard key={gathering.id} gathering={gathering} />
          ))}
        </div>
      </Section>
    </>
  );
}
