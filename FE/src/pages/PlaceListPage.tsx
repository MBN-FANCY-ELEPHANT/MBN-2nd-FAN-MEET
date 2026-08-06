import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import HeaderBack from "../components/layout/HeaderBack";
import PlaceCard from "../components/play/PlaceCard";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import styles from "./ListPage.module.css";

/**
 * 성지순례 전체 목록 — PLAY 의 `전체보기` 목적지.
 *
 * ⚠️ **디자인에 없는 화면입니다.** PLAY 는 가로 캐러셀로 일부만 보여주므로 전체를 볼 곳이
 * 필요했습니다. 카드는 캐러셀과 같은 것을 쓰되 2열 그리드로 배치했습니다.
 *
 * ⚠️ **정책**: 모든 장소는 공개된 출처(`sourceUrl`)가 있는 것만 등록돼 있습니다.
 * 지도는 임베드하지 않고 외부 링크로만 연결합니다.
 */
export default function PlaceListPage() {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["places", STAR_ID],
    queryFn: () => api.getPlaces({ starId: STAR_ID, size: 50 }),
  });

  return (
    <div className={styles.page}>
      <HeaderBack title={t("play.pilgrimage")} />

      <div className={styles.body}>
        {isPending && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {data?.content?.length === 0 && (
          <EmptyState message={t("list.empty")} />
        )}

        {data && data.content && data.content.length > 0 && (
          <>
            <p className={styles.count}>
              {t("list.count", { count: data.totalElements ?? 0 })}
            </p>
            <div className={styles.stack}>
              {data.content.map((place) => (
                <PlaceCard key={place.id} place={place} wide />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
