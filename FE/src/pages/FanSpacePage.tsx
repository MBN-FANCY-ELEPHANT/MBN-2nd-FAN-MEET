import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import concertImg from "../assets/category/concert.png";
import gatheringImg from "../assets/category/gathering.png";
import goodsImg from "../assets/category/goods.png";
import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";
import VoteBanner from "../components/live/VoteBanner";
import Icon from "../components/ui/Icon";
import { ErrorState, LoadingState } from "../components/ui/States";
import {
  getSelectedArtist,
  shortArtistName,
  withKoreanNameParticle,
} from "../features/artist/selectedArtist";
import { MASCOT } from "../features/voice/mascot";
import { currentLocale } from "../i18n";
import { formatDate } from "../lib/format";
import styles from "./FanSpacePage.module.css";

/**
 * 팬공간 (Figma 27:5115).
 *
 * ⚠️ 메뉴가 **3개로 줄었습니다** — 모집 / 응모 / 굿즈. 투표는 메뉴에서 빠지고
 *    상단 배너로 옮겨갔습니다 (직전 구현의 4개 탭 구조는 폐기).
 *
 * 아래 **캘린더**는 이 아티스트의 일정을 모아 보여줍니다. 기존 `Schedule` 도메인을
 * 그대로 씁니다 — 티켓팅 응모·결과 공개 같은 항목은 시드에 추가하면 그대로 뜹니다.
 */

const MENU = [
  {
    to: "/fanspace/gathering",
    labelKey: "fanspace.category.gathering",
    image: gatheringImg,
  },
  {
    to: "/fanspace/concert",
    labelKey: "fanspace.category.concert",
    image: concertImg,
  },
  {
    to: "/fanspace/goods",
    labelKey: "fanspace.category.goods",
    image: goodsImg,
  },
] as const;

export default function FanSpacePage({
  onOpenVoice,
}: {
  onOpenVoice: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = currentLocale();

  const { data: star } = useQuery({
    queryKey: ["star", STAR_ID],
    queryFn: () => api.getStar(STAR_ID),
    staleTime: 5 * 60 * 1000,
  });

  const artist = getSelectedArtist() ?? star?.name ?? "";
  const shortName = artist ? shortArtistName(artist) : "";

  return (
    <div className={styles.page}>
      <AppHeader />

      <button className={styles.search} onClick={() => navigate("/search")}>
        <Icon name="magnifier" size={24} />
        <span className={styles.searchPlaceholder}>
          {t("app.searchPlaceholder")}
        </span>
      </button>

      <div className={styles.greetingRow}>
        {MASCOT.banner && (
          <img
            className={styles.greetingMascot}
            src={MASCOT.banner}
            alt=""
            aria-hidden
          />
        )}
        <h1 className={styles.greeting}>
          {t("star.dailyGreeting", {
            name:
              locale === "ko" ? withKoreanNameParticle(shortName) : shortName,
          })}
        </h1>
      </div>

      <VoteBanner />

      <section className={styles.sheet}>
        <nav className={styles.menu}>
          {MENU.map(({ to, labelKey, image }) => (
            <Link key={to} to={to} className={styles.menuItem}>
              <span className={styles.menuTile}>
                <img src={image} alt="" aria-hidden />
              </span>
              <span className={styles.menuLabel}>{t(labelKey)}</span>
            </Link>
          ))}
        </nav>

        <Calendar />
      </section>

      <BottomNav onOpenVoice={onOpenVoice} />
    </div>
  );
}

/** 아티스트 일정 모아보기 (Figma 27:5115 하단). */
function Calendar() {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["schedules", STAR_ID, "calendar"],
    queryFn: () => api.getSchedules({ starId: STAR_ID, size: 20 }),
  });

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHead}>
        <h2 className={styles.calendarTitle}>{t("fanspace.calendar")}</h2>
        <Link to="/schedules" className={styles.calendarMore}>
          {t("fanspace.calendarDetail")}
          <Icon name="arrowRight" size={20} className={styles.moreIcon} />
        </Link>
      </div>

      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}

      {/* 행마다 구분선을 긋지 않고, 점들을 잇는 세로선 하나로 묶습니다 (Figma 27:5115) */}
      <div className={styles.timeline}>
        {data?.content?.map((schedule) => (
          <div key={schedule.id} className={styles.calendarRow}>
            <span className={styles.dot} aria-hidden />
            <span className={styles.calendarText}>
              <span className={styles.calendarDate}>
                {formatDate(schedule.startAt)}
              </span>
              <span className={styles.calendarLabel}>{schedule.title}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
