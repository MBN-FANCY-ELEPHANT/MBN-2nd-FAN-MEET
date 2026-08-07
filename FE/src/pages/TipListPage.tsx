import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../api/client";
import { getSelectedStarId } from "../features/artist/selectedArtist";
import HeaderBack from "../components/layout/HeaderBack";
import TipCard from "../components/play/TipCard";
import ChipRow from "../components/ui/ChipRow";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import styles from "./ListPage.module.css";

/**
 * 응원하기 전체 목록 — PLAY 의 `전체보기` 목적지.
 *
 * ⚠️ **디자인에 없는 화면입니다.** 카테고리 필터를 둔 이유는 팁이 성격별로 확실히
 * 갈리기 때문입니다 — 투표하러 온 사람과 티켓팅 준비하는 사람은 찾는 게 다릅니다.
 */

const CATEGORIES = [
  "ALL",
  "VOTE",
  "STREAMING",
  "TICKETING",
  "CHEER",
  "FANCLUB",
] as const;
type Category = (typeof CATEGORIES)[number];

export default function TipListPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category>("ALL");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["tips", getSelectedStarId(), category],
    queryFn: () =>
      api.getTips({
        starId: getSelectedStarId(),
        size: 50,
        category: category === "ALL" ? undefined : category,
      }),
  });

  return (
    <div className={styles.page}>
      <HeaderBack title={t("play.cheer")} />

      <div className={styles.body}>
        <ChipRow
          options={CATEGORIES.map((value) => ({
            value,
            label: value === "ALL" ? t("list.all") : t(`tip.category.${value}`),
          }))}
          value={category}
          onChange={setCategory}
        />

        {isPending && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {data?.content?.length === 0 && (
          <EmptyState message={t("list.empty")} />
        )}

        {data && data.content && data.content.length > 0 && (
          <div className={styles.grid}>
            {data.content.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
