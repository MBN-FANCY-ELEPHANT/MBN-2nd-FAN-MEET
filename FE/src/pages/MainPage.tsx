import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import FeedThread from "../components/feed/FeedThread";
import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";
import LiveBanner from "../components/live/LiveBanner";
import Icon from "../components/ui/Icon";
import {
  getSelectedArtist,
  shortArtistName,
  withKoreanNameParticle,
} from "../features/artist/selectedArtist";
import { MASCOT } from "../features/voice/mascot";
import { currentLocale } from "../i18n";
import styles from "./MainPage.module.css";

/**
 * 메인 = 소식 탭 (Figma 27:6018 / 소식섹션 27:6288).
 *
 * 구성: 헤더 → 검색바 → 마스코트+인사 → **LIVE 스트리밍 배너** → 소식 시트 → 하단 네비
 *
 * ⚠️ 하단 네비가 **2탭(소식·팬공간) + 중앙 마이크**로 확정됐습니다. 직전 구현의
 *    "큰 기능 버튼 6개" 홈은 디자인에서 사라졌습니다.
 */
export default function MainPage({ onOpenVoice }: { onOpenVoice: () => void }) {
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

      {/* 마스코트가 인사말 왼쪽에 붙습니다 (Figma 27:6021, 좌우 반전) */}
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

      <LiveBanner />

      <section className={styles.sheet}>
        <h2 className={styles.sheetTitle}>{t("feed.title")}</h2>
        {/* 아티스트 글 · 팬매니저 공지 · 무대 롱폼이 최신순으로 섞입니다.
            소식 탭(`/feed`)과 **같은 컴포넌트**입니다 — 한쪽만 고치면 갈라집니다. */}
        <FeedThread />
      </section>

      <BottomNav onOpenVoice={onOpenVoice} />
    </div>
  );
}
