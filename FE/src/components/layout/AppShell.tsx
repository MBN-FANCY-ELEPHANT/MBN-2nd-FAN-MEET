import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import exampleHero from "../../assets/example/example_hero.png";
import {
  getSelectedArtist,
  shortArtistName,
  withKoreanNameParticle,
} from "../../features/artist/selectedArtist";
import { useAuth } from "../../features/auth/useAuth";
import { MASCOT } from "../../features/voice/mascot";
import { LOCALE_LABEL, currentLocale } from "../../i18n";
import Icon from "../ui/Icon";
import type { IconName } from "../ui/Icon";
import styles from "./AppShell.module.css";
import LanguageSheet from "./LanguageSheet";

/**
 * 팬공간 / 소식 / 방송 세 화면이 공유하는 셸 (Figma 19:912 · 19:2957 · 19:3203).
 *
 * ⚠️ **디자인 2차본에서 IA 가 통째로 바뀌었습니다.**
 *  - 상단 탭 `HOME / COMMUNITY / PLAY` → **하단 탭바** `팬공간 / 소식 / 방송`
 *  - 로고 `MBN AI` → **`매일{아티스트}`** (랜딩에서 고른 아티스트로 브랜딩)
 *  - 헤더에 **알림 벨** 추가
 *  - 히어로가 탭에 따라 갈립니다 — 소식·팬공간은 방송 프로모 카드, 방송은 AI 배너
 *
 * ⚠️ 알림 벨과 프로모 카드는 아직 **정적**입니다. BE 계약이 없습니다(개편 3단계).
 */

const TABS = [
  { to: "/fanspace", key: "fanspace", icon: "heartOutline" },
  { to: "/feed", key: "feed", icon: "megaphone" },
  { to: "/broadcast", key: "broadcast", icon: "youtube" },
] as const satisfies ReadonlyArray<{
  to: string;
  key: string;
  icon: IconName;
}>;

type TabKey = (typeof TABS)[number]["key"];

function activeTabKey(pathname: string): TabKey {
  if (pathname.startsWith("/fanspace")) return "fanspace";
  if (pathname.startsWith("/broadcast")) return "broadcast";
  return "feed";
}

type Props = {
  /** 스타 표시명 (예: 임영웅). 랜딩에서 고른 아티스트가 있으면 그쪽이 우선입니다 */
  starName: string;
  /** 음성 AI 오버레이 열기 — 방송 탭 배너가 씁니다 */
  onOpenVoice: () => void;
  /** 데모 로그인 시트 열기 */
  onOpenLogin: () => void;
};

export default function AppShell({
  starName,
  onOpenVoice,
  onOpenLogin,
}: Props) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [languageOpen, setLanguageOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const tab = activeTabKey(pathname);
  const locale = currentLocale();

  // 랜딩에서 고른 아티스트가 이 공간의 주인입니다. 없으면 시드 스타로 폴백합니다.
  const artist = getSelectedArtist() ?? starName;
  const shortName = artist ? shortArtistName(artist) : "";

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.logo}>
          {shortName ? t("app.artistLogo", { name: shortName }) : t("app.logo")}
        </span>
        <div className={styles.headerActions}>
          {isAuthenticated && user ? (
            <button
              className={styles.avatarButton}
              onClick={logout}
              aria-label={t("auth.logout")}
            >
              <img src={user.profileImageUrl} alt="" />
            </button>
          ) : (
            <button className={styles.loginButton} onClick={onOpenLogin}>
              {t("auth.login")}
            </button>
          )}
          <button
            className={styles.langButton}
            onClick={() => setLanguageOpen(true)}
            aria-label={t("language.title")}
          >
            <Icon name="earth" size={16} />
            <span>{LOCALE_LABEL[locale]}</span>
          </button>
          {/* 알림 목록 화면은 아직 없습니다 — 벨은 디자인 반영용 자리표시자입니다 */}
          <button
            className={styles.iconButton}
            aria-label={t("notification.title")}
          >
            <Icon name="notificationBell" size={24} />
          </button>
        </div>
      </header>

      <button className={styles.search} onClick={() => navigate("/search")}>
        <Icon name="magnifier" size={24} />
        <span className={styles.searchPlaceholder}>
          {t("app.searchPlaceholder")}
        </span>
      </button>

      <h1 className={styles.greeting}>
        {t("star.dailyGreeting", {
          // 한국어만 받침에 따라 `이` 를 붙입니다 — 다른 언어는 이름 그대로 씁니다
          name: locale === "ko" ? withKoreanNameParticle(shortName) : shortName,
        })}
      </h1>

      {tab === "broadcast" ? (
        <button className={styles.hero} onClick={onOpenVoice}>
          <span className={styles.heroAi}>
            <span className={styles.heroAiSub}>{t("banner.play.sub")}</span>
            <span className={styles.heroAiCta}>{t("banner.play.cta")}</span>
          </span>
          {MASCOT.banner && (
            <img
              className={styles.heroMascot}
              src={MASCOT.banner}
              alt=""
              aria-hidden
            />
          )}
        </button>
      ) : (
        <button className={styles.hero} onClick={() => navigate("/broadcast")}>
          {/* ⚠️ 편성 데이터가 없어 예시 이미지·문구입니다 (Figma 19:916) */}
          <img
            className={styles.heroImage}
            src={exampleHero}
            alt=""
            aria-hidden
          />
          <span className={styles.heroScrim} aria-hidden />
          <span className={styles.heroPromo}>
            <span className={styles.heroPromoTime}>
              {t("broadcast.onAirAt", { time: "오후 7:00" })}
            </span>
            <span className={styles.heroPromoTitle}>한일가왕전</span>
          </span>
        </button>
      )}

      <main className={styles.sheet}>
        <Outlet />
      </main>

      {/* 음성 AI 진입점. 디자인 2차본에서 마이크 FAB 이 **마스코트로 대체**됐을 뿐,
          누르면 기존과 똑같이 음성 오버레이가 열립니다 (docs/ai-stack.md §2). */}
      {MASCOT.banner && (
        <button
          className={styles.mascotFab}
          onClick={onOpenVoice}
          aria-label={t("chat.title")}
        >
          <img src={MASCOT.banner} alt="" aria-hidden />
        </button>
      )}

      <nav className={styles.nav}>
        {TABS.map(({ to, key, icon }) => (
          <NavLink
            key={key}
            to={to}
            className={`${styles.navItem} ${tab === key ? styles.navItemActive : ""}`}
          >
            <Icon name={icon} size={24} className={styles.navIcon} />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>

      {languageOpen ? (
        <LanguageSheet onClose={() => setLanguageOpen(false)} />
      ) : null}
    </div>
  );
}
