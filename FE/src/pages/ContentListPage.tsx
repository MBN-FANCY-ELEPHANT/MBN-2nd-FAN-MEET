import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import { ContentGridCard } from "../components/content/ContentCard";
import HeaderBack from "../components/layout/HeaderBack";
import ChipRow from "../components/ui/ChipRow";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import styles from "./ListPage.module.css";

/**
 * 콘텐츠 전체 목록 — HOME 의 `아카이브 > 전체보기` 목적지.
 *
 * ⚠️ **디자인에 없는 화면입니다.** 탭 화면에 링크만 있고 목적지가 비어 있어서
 * 기존 카드 컴포넌트와 Chip(2:1228)을 재사용해 채웠습니다. 새 시각 언어를 만들지 않았습니다.
 */

type Filter = "ALL" | "ARTICLE" | "VIDEO" | "LIVE";

export default function ContentListPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("ALL");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["contents", STAR_ID, filter],
    queryFn: () =>
      api.getContents({
        starId: STAR_ID,
        size: 50,
        type: filter === "ARTICLE" || filter === "VIDEO" ? filter : undefined,
        live: filter === "LIVE" ? true : undefined,
      }),
  });

  const options = [
    { value: "ALL" as const, label: t("list.all") },
    { value: "ARTICLE" as const, label: t("content.badge.article") },
    { value: "VIDEO" as const, label: t("content.badge.video") },
    { value: "LIVE" as const, label: t("content.badge.live") },
  ];

  return (
    <div className={styles.page}>
      <HeaderBack title={t("home.archive")} />

      <div className={styles.body}>
        <ChipRow options={options} value={filter} onChange={setFilter} />

        {isPending && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}

        {data && (
          <>
            <p className={styles.count}>
              {t("list.count", { count: data.totalElements ?? 0 })}
            </p>
            {data.content?.length === 0 ? (
              <EmptyState message={t("list.empty")} />
            ) : (
              <div className={styles.grid}>
                {data.content?.map((content) => (
                  <ContentGridCard key={content.id} content={content} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
