import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import ContentCard from "../components/content/ContentCard";
import GatheringCard from "../components/gathering/GatheringCard";
import HeaderBack from "../components/layout/HeaderBack";
import PlaceCard from "../components/play/PlaceCard";
import TipCard from "../components/play/TipCard";
import Icon from "../components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { formatDate } from "../lib/format";
import styles from "./ListPage.module.css";

/**
 * 통합 검색 — 셸의 검색바 목적지.
 *
 * ⚠️ **디자인에 없는 화면입니다.** 검색바는 그려져 있는데 결과 화면이 없어서 만들었습니다.
 *
 * 카테고리별로 상위 5건씩 묶어 보여줍니다. 한 카테고리가 결과를 독점하면
 * "이 플랫폼에 뭐가 있는지"가 안 보이기 때문입니다.
 */
export default function SearchPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [draft, setDraft] = useState(query);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["search", STAR_ID, query],
    queryFn: () => api.search({ starId: STAR_ID, q: query }),
    enabled: query.trim().length > 0,
  });

  const isEmpty =
    data &&
    !data.contents?.length &&
    !data.schedules?.length &&
    !data.gatherings?.length &&
    !data.places?.length &&
    !data.tips?.length;

  return (
    <div className={styles.page}>
      <HeaderBack title={t("search.title")} />

      <div className={styles.body}>
        <form
          className={styles.searchBar}
          onSubmit={(e) => {
            e.preventDefault();
            setParams(draft.trim() ? { q: draft.trim() } : {});
          }}
        >
          <Icon name="magnifier" size={24} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("app.searchPlaceholder")}
            autoFocus
          />
        </form>

        {!query && <EmptyState message={t("search.hint")} />}
        {query && isPending && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {isEmpty && <EmptyState message={t("search.noResult", { query })} />}

        {data && data.contents && data.contents.length > 0 && (
          <div className={styles.group}>
            <p className={styles.sectionTitle}>{t("home.archive")}</p>
            <div className="scroll-x">
              {data.contents.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </div>
        )}

        {data && data.schedules && data.schedules.length > 0 && (
          <div className={styles.group}>
            <p className={styles.sectionTitle}>{t("home.upcomingSchedule")}</p>
            <div className={styles.stack}>
              {data.schedules.map((schedule) => (
                <div key={schedule.id} className={styles.schedule}>
                  <div className={styles.scheduleHead}>
                    <span className={styles.scheduleDate}>
                      {formatDate(schedule.startAt)}
                    </span>
                  </div>
                  <p className={styles.scheduleTitle}>{schedule.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data && data.gatherings && data.gatherings.length > 0 && (
          <div className={styles.group}>
            <p className={styles.sectionTitle}>
              {t("community.offlineGatherings")}
            </p>
            <div className={styles.stack}>
              {data.gatherings.map((gathering) => (
                <GatheringCard key={gathering.id} gathering={gathering} />
              ))}
            </div>
          </div>
        )}

        {data && data.places && data.places.length > 0 && (
          <div className={styles.group}>
            <p className={styles.sectionTitle}>{t("play.pilgrimage")}</p>
            <div className={styles.stack}>
              {data.places.map((place) => (
                <PlaceCard key={place.id} place={place} wide />
              ))}
            </div>
          </div>
        )}

        {data && data.tips && data.tips.length > 0 && (
          <div className={styles.group}>
            <p className={styles.sectionTitle}>{t("play.cheer")}</p>
            <div className={styles.grid}>
              {data.tips.map((tip) => (
                <TipCard key={tip.id} tip={tip} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
