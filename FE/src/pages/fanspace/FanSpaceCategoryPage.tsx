import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../../api/client";
import { STAR_ID } from "../../app/constants";
import exampleHero from "../../assets/example/example_hero.png";
import GatheringCard from "../../components/gathering/GatheringCard";
import HeaderBack from "../../components/layout/HeaderBack";
import {
  EmptyMascotState,
  ErrorState,
  LoadingState,
} from "../../components/ui/States";
import TabBar from "../../components/ui/TabBar";
import { formatDeadline } from "../../lib/format";
import styles from "./FanSpaceCategory.module.css";

/**
 * 팬공간 카테고리 (Figma 22:4264 공연 · 22:4214 투표 · 23:4956 굿즈 · 23:4710 모집).
 *
 * ⚠️ **4개가 별도 화면이 아니라 상단 밑줄 탭 하나로 묶입니다.** 이전 구현은 라우트를
 *    4개로 쪼갰는데, 디자인을 보니 헤더·탭바를 공유하고 본문만 갈아끼우는 구조였습니다.
 *
 * ⚠️ 공연·투표·굿즈는 BE 도메인이 없습니다. 화면 구조만 디자인대로 세우고 데이터는
 *    임시입니다 (모집만 실제 `Gathering` 연동).
 */

const TABS = ["concert", "vote", "goods", "gathering"] as const;
type Category = (typeof TABS)[number];

function isCategory(value: string | undefined): value is Category {
  return TABS.includes(value as Category);
}

export default function FanSpaceCategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams();
  const active: Category = isCategory(category) ? category : "concert";

  return (
    <div className={styles.page}>
      <HeaderBack />
      <div className={styles.body}>
        <TabBar
          options={TABS.map((value) => ({
            value,
            label: t(`fanspace.category.${value}`),
          }))}
          value={active}
          onChange={(next) => navigate(`/fanspace/${next}`, { replace: true })}
        />

        {active === "concert" && <ConcertView />}
        {active === "vote" && <VoteView />}
        {active === "goods" && <GoodsView />}
        {active === "gathering" && <GatheringView />}
      </div>
    </div>
  );
}

/* ── 공연 ─────────────────────────────────────────────────────────── */

/** ⚠️ 응모 도메인이 없어 일정(Schedule)을 응모 카드 형태로 세웠습니다. */
function ConcertView() {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["schedules", STAR_ID, "concert"],
    queryFn: () => api.getSchedules({ starId: STAR_ID, size: 20 }),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const items = data.content ?? [];
  if (items.length === 0)
    return <EmptyMascotState message={t("fanspace.empty.concert")} />;

  return (
    <div className={styles.list}>
      {items.map((schedule) => {
        // 지난 일정은 `응모 종료`, 예정은 `응모 중` — 실제 응모 상태가 아니라 임시 매핑입니다
        const open = new Date(schedule.startAt).getTime() > Date.now();
        return (
          <Link
            key={schedule.id}
            to="/schedules"
            className={styles.concertCard}
          >
            <img className={styles.concertPoster} src={exampleHero} alt="" />
            <div className={styles.concertBody}>
              <div className={styles.concertTop}>
                <span
                  className={`${styles.entryBadge} ${open ? "" : styles.entryBadgeClosed}`}
                >
                  {t(open ? "fanspace.entryOpen" : "fanspace.entryClosed")}
                </span>
                <span className={styles.deadline}>
                  {formatDeadline(schedule.startAt.slice(0, 10))}
                </span>
              </div>
              <div className={styles.concertBottom}>
                <p className={styles.concertTitle}>{schedule.title}</p>
                <span className={styles.concertStatus}>
                  {open
                    ? t("fanspace.entryCount", { count: 10000 })
                    : t("fanspace.entryWon")}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ── 투표 ─────────────────────────────────────────────────────────── */

/** ⚠️ 투표 도메인이 없습니다. 디자인이 **빈 상태**를 기준으로 그려져 있어 그대로 따릅니다. */
function VoteView() {
  const { t } = useTranslation();
  return <EmptyMascotState message={t("fanspace.empty.vote")} />;
}

/* ── 굿즈 ─────────────────────────────────────────────────────────── */

/** ⚠️ 굿즈 도메인·상품 이미지가 없어 정적 더미입니다 (Figma 23:4956 구조만 반영). */
const DRAFT_GOODS = [
  { id: 1, name: "슬로건", price: 30000 },
  { id: 2, name: "응원 파우치", price: 14000 },
  { id: 3, name: "응원 키링", price: 30000 },
  { id: 4, name: "응원 스티커", price: 30000 },
] as const;

function GoodsView() {
  const { t } = useTranslation();
  return (
    <>
      <h2 className={styles.sectionTitle}>{t("fanspace.goodsTop4")}</h2>
      <div className="grid-2">
        {DRAFT_GOODS.map((goods) => (
          <div key={goods.id} className={styles.goodsCard}>
            <img className={styles.goodsThumb} src={exampleHero} alt="" />
            <div className={styles.goodsBody}>
              <p className={styles.goodsName}>{goods.name}</p>
              <p className={styles.goodsPrice}>
                {goods.price.toLocaleString()}
                {t("fanspace.currency")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>{t("fanspace.goodsLightstick")}</h2>
      <div className="scroll-x">
        {DRAFT_GOODS.slice(0, 3).map((goods) => (
          <div key={goods.id} className={styles.miniCard}>
            <img className={styles.miniThumb} src={exampleHero} alt="" />
            <div className={styles.miniBody}>
              <p className={styles.miniTitle}>{goods.name}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 모집 ─────────────────────────────────────────────────────────── */

function GatheringView() {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["gatherings", STAR_ID],
    queryFn: () => api.getGatherings({ starId: STAR_ID, size: 20 }),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const items = data.content ?? [];
  if (items.length === 0)
    return <EmptyMascotState message={t("fanspace.empty.gathering")} />;

  // ⚠️ "신청한 모집"은 로그인 사용자의 신청 목록이어야 하는데 목록 API 가 없습니다.
  //    지금은 모집 중인 앞 3건을 대신 보여줍니다 (개편 3단계에서 계약 추가).
  const applied = items.slice(0, 3);

  return (
    <>
      <h2 className={styles.sectionTitle}>{t("fanspace.appliedGatherings")}</h2>
      <div className="scroll-x">
        {applied.map((gathering) => (
          <Link
            key={gathering.id}
            to={`/community/gatherings/${gathering.id}`}
            className={styles.miniCard}
          >
            <img
              className={styles.miniThumb}
              src={gathering.coverImageUrl}
              alt=""
            />
            <div className={styles.miniBody}>
              <p className={styles.miniTitle}>{gathering.title}</p>
              {/* 목록 응답에는 집결지·행사일이 없어 주최자와 마감일로 대신합니다 */}
              <div className={styles.miniMeta}>
                <span>{gathering.hostNickname}</span>
                <span>{formatDeadline(gathering.deadline)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>
        {t("community.offlineGatherings")}
      </h2>
      <div className={styles.list}>
        {items.map((gathering) => (
          <GatheringCard key={gathering.id} gathering={gathering} />
        ))}
      </div>
    </>
  );
}
