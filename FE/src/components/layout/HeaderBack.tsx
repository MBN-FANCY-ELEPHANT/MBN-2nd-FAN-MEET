import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  getSelectedArtist,
  shortArtistName,
} from "../../features/artist/selectedArtist";
import { LOCALE_LABEL, currentLocale } from "../../i18n";
import Icon from "../ui/Icon";
import styles from "./HeaderBack.module.css";
import LanguageSheet from "./LanguageSheet";

/**
 * 뒤로가기 헤더 (Figma `2:1209` / 신규 `22:4265`).
 *
 * 두 가지 모드가 있습니다:
 *  - `title` 을 주면 그 문구를 검정 볼드로 (기존 상세 화면들)
 *  - `title` 없이 쓰면 **`매일{아티스트}` 브랜드**를 primary 로 (디자인 2차본 신규 화면들).
 *    이때 헤더는 배경·구분선 없이 페이지 위에 얹힙니다.
 *
 * 언어 칩은 항상 유지합니다 — 어느 화면에서든 언어를 바꿀 수 있어야 하니까요.
 */
export default function HeaderBack({ title }: { title?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [languageOpen, setLanguageOpen] = useState(false);

  const brand = title === undefined;
  const artist = getSelectedArtist();
  const brandLabel = artist
    ? t("app.artistLogo", { name: shortArtistName(artist) })
    : t("app.logo");

  return (
    <>
      <header className={`${styles.header} ${brand ? styles.headerBrand : ""}`}>
        <button
          className={styles.back}
          onClick={() => navigate(-1)}
          aria-label={t("app.back")}
        >
          <Icon name="arrowLeft" size={24} />
        </button>
        <span className={brand ? styles.titleBrand : styles.title}>
          {brand ? brandLabel : title}
        </span>
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
