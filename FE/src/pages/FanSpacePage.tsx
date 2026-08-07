import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import concertImg from "../assets/category/concert.png";
import gatheringImg from "../assets/category/gathering.png";
import goodsImg from "../assets/category/goods.png";
import voteImg from "../assets/category/vote.png";
import GatheringCard from "../components/gathering/GatheringCard";
import Section from "../components/ui/Section";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import styles from "./FanSpacePage.module.css";

/**
 * 팬공간 탭 (Figma 19:2957).
 *
 * 활동 기록 4카테고리 타일이 **각각 별도 화면으로** 들어갑니다 (탭 안에서 필터링하지
 * 않습니다). 아래에는 가장 활발한 모집 목록을 미리 보여줍니다.
 *
 * ⚠️ 공연·투표·굿즈 화면은 **디자인 제작 중**이라 임시 레이아웃입니다.
 */

const CATEGORIES = [
  { key: "concert", image: concertImg, to: "/fanspace/concert" },
  { key: "vote", image: voteImg, to: "/fanspace/vote" },
  { key: "goods", image: goodsImg, to: "/fanspace/goods" },
  { key: "gathering", image: gatheringImg, to: "/fanspace/gathering" },
] as const;

export default function FanSpacePage() {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["gatherings", STAR_ID],
    queryFn: () => api.getGatherings({ starId: STAR_ID, size: 20 }),
  });

  return (
    <>
      <h2 className={styles.title}>{t("fanspace.title")}</h2>

      <div className={styles.categories}>
        {CATEGORIES.map(({ key, image, to }) => (
          <Link key={key} to={to} className={styles.category}>
            <span className={styles.tile}>
              <img src={image} alt="" aria-hidden />
            </span>
            <span className={styles.categoryLabel}>
              {t(`fanspace.category.${key}`)}
            </span>
          </Link>
        ))}
      </div>

      <Section
        title={t("fanspace.category.gathering")}
        seeAllTo="/fanspace/gathering"
      >
        {isPending && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {data && data.content?.length === 0 && (
          <EmptyState message={t("list.empty")} />
        )}
        {data && data.content && data.content.length > 0 && (
          <div className={styles.list}>
            {data.content.slice(0, 3).map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
