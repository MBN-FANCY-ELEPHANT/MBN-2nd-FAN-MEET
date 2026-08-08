import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { api } from "../../api/client";
import { concertPosterImage } from "../../data/programs";
import GatheringCard from "../../components/gathering/GatheringCard";
import HeaderBack from "../../components/layout/HeaderBack";
import Icon from "../../components/ui/Icon";
import {
  EmptyMascotState,
  ErrorState,
  LoadingState,
} from "../../components/ui/States";
import { goodsByCategory, goodsForArtist, goodsImage } from "../../data/goods";
import type { Goods } from "../../data/goods";
import { formatDeadline } from "../../lib/format";
import styles from "./FanSpaceCategory.module.css";
import { getSelectedArtist, getSelectedStarId } from "../../features/artist/selectedArtist";

/**
 * 팬공간 카테고리 (Figma 22:4264 공연 · 22:4214 투표 · 23:4956 굿즈 · 23:4710 모집).
 *
 * ⚠️ **4개가 별도 화면이 아니라 라우트 파라미터로 본문만 갈아끼우는 구조입니다.**
 *    상단 밑줄 탭바는 제거했습니다 — 각 카테고리 진입은 `FanSpacePage`의 메뉴 타일에서
 *    바로 라우팅됩니다.
 *
 * ⚠️ 투표·굿즈는 BE 도메인이 없습니다. 화면 구조만 디자인대로 세우고 데이터는 임시입니다.
 *    모집(`Gathering`)과 **공연 응모(`ConcertEntry`)** 는 실제 API 입니다.
 */

const TABS = ["concert", "vote", "goods", "gathering"] as const;
type Category = (typeof TABS)[number];

function isCategory(value: string | undefined): value is Category {
  return TABS.includes(value as Category);
}

/**
 * 공연 포스터. **`schedule` 에는 이미지 컬럼이 없어서** 응답에서 가져올 수 없고,
 * 선택한 아티스트의 폴더에서 한 장을 씁니다 (`public/artists/<slug>/concert.jpg`).
 * 일정별로 다른 포스터가 필요해지면 그때 BE 에 컬럼을 추가하세요.
 */
function concertPoster(): string {
  return concertPosterImage(getSelectedArtist());
}

export default function FanSpaceCategoryPage() {
  const { category } = useParams();
  const active: Category = isCategory(category) ? category : "concert";

  return (
    <div className={styles.page}>
      <HeaderBack />
      <div className={styles.body}>
        {active === "concert" && <ConcertView />}
        {active === "vote" && <VoteView />}
        {active === "goods" && <GoodsView />}
        {active === "gathering" && <GatheringView />}
      </div>
    </div>
  );
}

/* ── 공연 ─────────────────────────────────────────────────────────── */

/**
 * 공연 목록 — 일정(Schedule)을 응모 카드 형태로 세웠습니다.
 *
 * 카드를 탭하면 `/fanspace/concert/{id}` 응모 화면으로 갑니다.
 * 이미 응모한 공연은 위쪽 **응모 내역** 에 따로 모아 둡니다 — 중장년 사용자가
 * "내가 신청했나?"를 목록에서 뒤지지 않아도 되도록.
 *
 * 응모 상태는 서버(`GET /entries`)에서 옵니다. 비로그인이면 빈 배열이라 응모 내역
 * 섹션이 통째로 접힙니다.
 */
function ConcertView() {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["schedules", getSelectedStarId(), "concert"],
    queryFn: () => api.getSchedules({ starId: getSelectedStarId(), size: 20 }),
  });

  const { data: entries } = useQuery({
    queryKey: ["myEntries", getSelectedStarId()],
    queryFn: () => api.getMyEntries(getSelectedStarId()),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const items = data.content ?? [];
  if (items.length === 0)
    return <EmptyMascotState message={t("fanspace.empty.concert")} />;

  const enteredIds = new Set((entries ?? []).map((e) => e.scheduleId));
  const myEntries = items.filter((s) => enteredIds.has(s.id));

  return (
    <>
      {myEntries.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>{t("concert.myEntries")}</h2>
          <div className="scroll-x">
            {myEntries.map((schedule) => (
              <Link
                key={schedule.id}
                to={`/fanspace/concert/${schedule.id}`}
                className={styles.miniCard}
              >
                <img className={styles.miniThumb} src={concertPoster()} alt="" />
                <div className={styles.miniBody}>
                  <p className={styles.miniTitle}>{schedule.title}</p>
                  <div className={styles.miniMeta}>
                    <span>{t("concert.entryDoneTitle")}</span>
                    <span>{formatDeadline(schedule.startAt.slice(0, 10))}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* 위에 응모 내역 캐러셀이 있으면 붙어 보여서 간격을 벌립니다 (CSS 주석 참고) */}
      <div
        className={`${styles.list} ${myEntries.length > 0 ? styles.listAfterCarousel : ""}`}
      >
        {items.map((schedule) => {
          // 지난 일정은 `응모 종료`, 예정은 `응모 중` — 실제 응모 상태가 아니라 임시 매핑입니다
          const open = new Date(schedule.startAt).getTime() > Date.now();
          const mine = enteredIds.has(schedule.id);
          return (
            <Link
              key={schedule.id}
              to={`/fanspace/concert/${schedule.id}`}
              className={styles.concertCard}
            >
              <img className={styles.concertPoster} src={concertPoster()} alt="" />
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
                    {mine
                      ? t("concert.entryDoneTitle")
                      : open
                        ? t("fanspace.entryCount", { count: 10000 })
                        : t("fanspace.entryWon")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

/* ── 투표 ─────────────────────────────────────────────────────────── */

/** ⚠️ 투표 도메인이 없습니다. 디자인이 **빈 상태**를 기준으로 그려져 있어 그대로 따릅니다. */
function VoteView() {
  const { t } = useTranslation();
  return <EmptyMascotState message={t("fanspace.empty.vote")} />;
}

/* ── 굿즈 ─────────────────────────────────────────────────────────── */

/**
 * 굿즈 — 인기 TOP 4 를 위에, 아래는 **카테고리별 전체 목록** (Figma 23:4956).
 *
 * ⚠️ 굿즈 도메인이 BE 에 없어 `src/data/goods.ts` 의 정적 더미입니다.
 * ⚠️ 가격은 **표시 전용**입니다 — 상세에서 공식 판매처로 보냅니다.
 */
function GoodsView() {
  const { t } = useTranslation();
  const popular = goodsForArtist()
    .filter((g) => g.popular)
    .slice(0, 4);

  return (
    <>
      <h2 className={styles.sectionTitle}>{t("fanspace.goodsTop4")}</h2>
      <div className="grid-2">
        {popular.map((goods) => (
          <GoodsCard key={goods.id} goods={goods} />
        ))}
      </div>

      {goodsByCategory().map(({ category, items }) => (
        <div key={category}>
          <h2 className={styles.sectionTitle}>
            {t(`fanspace.goodsCategory.${category}`)}
          </h2>
          <div className="grid-2">
            {items.map((goods) => (
              <GoodsCard key={goods.id} goods={goods} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function GoodsCard({ goods }: { goods: Goods }) {
  const { t } = useTranslation();
  return (
    <Link to={`/fanspace/goods/${goods.id}`} className={styles.goodsCard}>
      <img className={styles.goodsThumb} src={goodsImage(goods)} alt="" />
      <div className={styles.goodsBody}>
        <p className={styles.goodsName}>{goods.name}</p>
        <p className={styles.goodsPrice}>
          {goods.price.toLocaleString()}
          {t("fanspace.currency")}
        </p>
      </div>
    </Link>
  );
}

/* ── 모집 ─────────────────────────────────────────────────────────── */

function GatheringView() {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["gatherings", getSelectedStarId()],
    queryFn: () => api.getGatherings({ starId: getSelectedStarId(), size: 20 }),
  });

  const { data: myApplied } = useQuery({
    queryKey: ["myGatherings", getSelectedStarId()],
    queryFn: () => api.getMyGatherings(getSelectedStarId()),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const items = data.content ?? [];
  if (items.length === 0)
    return <EmptyMascotState message={t("fanspace.empty.gathering")} />;

  // 실제 내 신청 목록입니다. 예전에는 "모집 중인 앞 3건" 을 대신 보여줬는데,
  // 신청하지도 않은 모임이 「신청한 모집」으로 떠서 자기 신청 상태를 오해하게 됩니다.
  const applied = myApplied ?? [];

  return (
    <>
      {/* 신청한 모집은 **대화방**으로 연결합니다 — 상세는 이미 본 화면이고,
          신청 뒤에 필요한 건 집결지·준비물을 묻는 자리입니다. */}
      {applied.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>
            {t("fanspace.appliedGatherings")}
          </h2>
          <div className="scroll-x">
            {applied.map((gathering) => (
              <Link
                key={gathering.id}
                to={`/community/gatherings/${gathering.id}/chat`}
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
                    <span className={styles.chatMark}>
                      <Icon name="chatBubble" size={14} />
                      {t("fanspace.openChatRoom")}
                    </span>
                    <span>{formatDeadline(gathering.deadline)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

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
