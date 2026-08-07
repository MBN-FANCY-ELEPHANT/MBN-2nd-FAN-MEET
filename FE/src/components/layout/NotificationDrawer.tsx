import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { NOTIFICATIONS } from "../../data/notifications";
import { listKeywords } from "../../features/notification/keywords";
import styles from "./NotificationDrawer.module.css";

/**
 * 알림 드로어 (Figma 27:6125) — 우측에서 밀려 들어옵니다.
 *
 * 팬이 **관심 키워드**로 등록해 둔 아티스트·주제에 새 소식이 생기면 알려줍니다
 * (예: "키워드 설정하신 '진이'에 대한 영상이 등록되었습니다").
 *
 * ⚠️ 알림 도메인이 BE 에 없어 목록은 정적 더미입니다. 키워드는 「키워드 등록」 버튼으로
 *    `/notifications/keywords` 에서 관리하며 **이 기기에만** 저장됩니다
 *    (`features/notification/keywords.ts` 주석 참고).
 */
export default function NotificationDrawer({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const keywords = listKeywords();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <button
        className={styles.dim}
        aria-label={t("app.back")}
        onClick={onClose}
      />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={t("notification.title")}
      >
        <div className={styles.head}>
          <h2 className={styles.title}>{t("notification.title")}</h2>
          <button
            className={styles.keywordButton}
            onClick={() => {
              onClose();
              navigate("/notifications/keywords");
            }}
          >
            {t("notification.registerKeyword")}
          </button>
        </div>

        {keywords.length > 0 && (
          <p className={styles.myKeywords}>
            {t("notification.myKeywords")}{" "}
            <span className={styles.myKeywordsWord}>
              {keywords.join(" · ")}
            </span>
          </p>
        )}

        <ul className={styles.list}>
          {NOTIFICATIONS.map((item) => (
            <li key={item.id} className={styles.item}>
              {t(item.messageKey, item.params)}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
