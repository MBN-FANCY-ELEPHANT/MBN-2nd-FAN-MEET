import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";
import { MASCOT } from "../../features/voice/mascot";
import { LOCALE_LABEL, currentLocale } from "../../i18n";
import Icon from "../ui/Icon";
import styles from "./AppShell.module.css";
import LanguageSheet from "./LanguageSheet";

/**
 * HOME / COMMUNITY / PLAY 세 화면이 공유하는 셸.
 *
 * 디자인 3화면의 상단부(헤더 → 탭바 → 검색바 → 스타 인사 → 배너)가 완전히 동일하므로
 * 셸을 1개만 두고 배너 문구와 본문만 탭별로 교체합니다 (docs/design-spec.md §1).
 *
 * ⚠️ 검색바는 일반 텍스트 검색 전용입니다. 초안에 있던 AI 모드는 디자인에서 삭제됐습니다.
 *    AI 진입점은 **마이크 FAB 단독**이며, 배너 CTA 도 같은 오버레이를 엽니다.
 */

const TABS = [
  { to: "/", key: "home" },
  { to: "/community", key: "community" },
  { to: "/play", key: "play" },
] as const;

function activeTabKey(pathname: string): "home" | "community" | "play" {
  if (pathname.startsWith("/community")) return "community";
  if (pathname.startsWith("/play")) return "play";
  return "home";
}

type Props = {
  /** 스타 표시명 (예: 임영웅) */
  starName: string;
  /** 스타 인사 문구 (예: 오늘 하루도 즐거운 하루되세요!) */
  greeting: string;
  /** 음성 AI 오버레이 열기 — 마이크 FAB 과 배너 CTA 가 공유합니다 */
  onOpenVoice: () => void;
  /** 데모 로그인 시트 열기 */
  onOpenLogin: () => void;
};

export default function AppShell({
  starName,
  greeting,
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

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.logo}>{t("app.logo")}</span>
        <div className={styles.headerActions}>
          {/* 로그인 상태를 아바타로 보여줍니다 — 댓글의 국가 배지와 이어지는 맥락입니다 */}
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
        </div>
      </header>

      <nav className={styles.tabbar}>
        {TABS.map(({ to, key }) => (
          <NavLink
            key={key}
            to={to}
            end={to === "/"}
            className={() =>
              `${styles.tab} ${tab === key ? styles.tabActive : ""}`
            }
          >
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>

      <div className={styles.topBody}>
        {/* 셸의 검색바는 입력을 받지 않고 검색 화면으로 넘깁니다 —
            결과를 이 화면에 끼워 넣으면 탭 구조가 무너집니다 */}
        <button className={styles.search} onClick={() => navigate("/search")}>
          <Icon name="magnifier" size={24} />
          <span className={styles.searchPlaceholder}>
            {t("app.searchPlaceholder")}
          </span>
        </button>

        <h1 className={styles.greetingTitle}>
          {t("star.fandomSpace", { name: starName })}
        </h1>
        <p className={styles.greetingSub}>{greeting}</p>

        <button className={styles.banner} onClick={onOpenVoice}>
          {/* 마스코트는 COMMUNITY 탭에만 있습니다 (Figma 6:772) */}
          {tab === "community" && MASCOT.banner && (
            <img
              className={styles.bannerMascot}
              src={MASCOT.banner}
              alt=""
              aria-hidden
            />
          )}
          <span className={styles.bannerText}>
            <span className={styles.bannerSub}>{t(`banner.${tab}.sub`)}</span>
            <span className={styles.bannerCta}>{t(`banner.${tab}.cta`)}</span>
          </span>
        </button>
      </div>

      <main className={styles.main}>
        <Outlet />
      </main>

      <button
        className={styles.micFab}
        onClick={onOpenVoice}
        aria-label={t("chat.title")}
      >
        <Icon name="mic" size={32} className={styles.micIcon} />
      </button>

      {languageOpen ? (
        <LanguageSheet onClose={() => setLanguageOpen(false)} />
      ) : null}
    </div>
  );
}
