import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LOCALE_LABEL, currentLocale } from "../../i18n";
import Icon from "../ui/Icon";
import styles from "./HeaderBack.module.css";
import LanguageSheet from "./LanguageSheet";

/**
 * 뒤로가기 헤더 (Figma `2:1209` — Header (Back)).
 *
 * 상세 화면들이 공유합니다. 탭 셸의 헤더와 달리 탭바·검색바·배너가 없습니다.
 * 언어 칩은 유지합니다 — 어느 화면에서든 언어를 바꿀 수 있어야 하니까요.
 */
export default function HeaderBack({ title }: { title?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [languageOpen, setLanguageOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <button
          className={styles.back}
          onClick={() => navigate(-1)}
          aria-label={t("app.back")}
        >
          <Icon name="arrowLeft" size={24} />
        </button>
        <span className={styles.title}>{title ?? t("app.logo")}</span>
        <button
          className={styles.langButton}
          onClick={() => setLanguageOpen(true)}
          aria-label={t("language.title")}
        >
          <Icon name="earth" size={16} />
          <span>{LOCALE_LABEL[currentLocale()]}</span>
        </button>
      </header>

      {languageOpen && <LanguageSheet onClose={() => setLanguageOpen(false)} />}
    </>
  );
}
