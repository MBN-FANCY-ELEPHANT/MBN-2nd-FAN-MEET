import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import micFab from "../../assets/icons/mic-fab.svg";
import Icon from "../ui/Icon";
import styles from "./BottomNav.module.css";

/**
 * 하단 네비게이션 (Figma 27:6110).
 *
 * ⚠️ **탭이 2개입니다** — 소식 / 팬공간. 가운데는 탭이 아니라 **음성 마이크 FAB** 이고,
 *    누르면 화면 이동이 아니라 음성 오버레이가 열립니다.
 *
 * 주 사용자층이 중장년이라 하단 고정 두 칸이 가장 헷갈리지 않는 구조입니다.
 */
export default function BottomNav({
  onOpenVoice,
}: {
  onOpenVoice: () => void;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const isFanSpace = pathname.startsWith("/fanspace");

  return (
    <nav className={styles.nav}>
      <div className={styles.bar}>
        <Link
          to="/home"
          className={`${styles.item} ${isFanSpace ? "" : styles.itemActive}`}
        >
          <Icon name="megaphone" size={24} className={styles.icon} />
          {t("nav.feed")}
        </Link>

        <span className={styles.spacer} aria-hidden />

        <Link
          to="/fanspace"
          className={`${styles.item} ${isFanSpace ? styles.itemActive : ""}`}
        >
          <Icon name="heartOutline" size={24} className={styles.icon} />
          {t("nav.fanspace")}
        </Link>
      </div>

      <button
        className={styles.mic}
        onClick={onOpenVoice}
        aria-label={t("chat.title")}
      >
        <img src={micFab} alt="" aria-hidden />
      </button>
    </nav>
  );
}
