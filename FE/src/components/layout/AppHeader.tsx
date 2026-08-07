import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  getSelectedArtist,
  shortArtistName,
} from "../../features/artist/selectedArtist";
import Icon from "../ui/Icon";
import styles from "./AppHeader.module.css";
import LanguageSheet from "./LanguageSheet";
import NotificationDrawer from "./NotificationDrawer";

/**
 * 공통 헤더 (Figma 27:6734 — 두 변형).
 *
 *   default : 매일{아티스트}  ·  🌐  ·  🔔
 *   back    : ‹ 매일{아티스트} ·  🌐          (알림 없음)
 *
 * ⚠️ 언어 선택이 **칩에서 아이콘만으로** 줄었습니다. 글자가 사라진 만큼
 *    `aria-label` 로 접근성을 유지합니다.
 *
 * ⚠️ 로고는 디자인상 `Yeongdo OTF Heavy`(영도체) 23px / letter-spacing -2.76px 입니다.
 *    프로젝트에 폰트 파일이 없어 Pretendard 로 대체했습니다. 손글씨 느낌이 필요하면
 *    폰트를 추가하거나 로고를 이미지로 내보내야 하는데, 아티스트마다 글자가 달라져서
 *    (매일서진 / 매일유진 …) **이미지로 만들면 동적 대응이 안 됩니다.**
 */
export default function AppHeader({
  variant = "default",
}: {
  variant?: "default" | "back";
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const artist = getSelectedArtist();
  const label = artist
    ? t("app.artistLogo", { name: shortArtistName(artist) })
    : t("app.logo");

  return (
    <>
      <header className={styles.header}>
        {variant === "back" && (
          <button
            className={styles.back}
            onClick={() => navigate(-1)}
            aria-label={t("app.back")}
          >
            <Icon name="arrowLeft" size={24} />
          </button>
        )}

        <span className={styles.logo}>{label}</span>

        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            onClick={() => setLanguageOpen(true)}
            aria-label={t("language.title")}
          >
            <Icon name="earth" size={24} />
          </button>
          {variant === "default" && (
            <button
              className={styles.iconButton}
              onClick={() => setNotificationOpen(true)}
              aria-label={t("notification.title")}
            >
              <Icon name="notificationBell" size={24} />
            </button>
          )}
        </div>
      </header>

      {languageOpen && <LanguageSheet onClose={() => setLanguageOpen(false)} />}
      {notificationOpen && (
        <NotificationDrawer onClose={() => setNotificationOpen(false)} />
      )}
    </>
  );
}
