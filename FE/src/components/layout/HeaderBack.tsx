import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  getSelectedArtist,
  shortArtistName,
} from "../../features/artist/selectedArtist";
import Icon from "../ui/Icon";
import styles from "./HeaderBack.module.css";
import LanguageSheet from "./LanguageSheet";

/**
 * 뒤로가기 헤더 (Figma `317:9144`).
 *
 * 두 가지 모드가 있습니다:
 *  - `title` 을 주면 그 문구를 검정 볼드로 (기존 상세 화면들)
 *  - `title` 없이 쓰면 **`매일{아티스트}` 브랜드**를 primary 로 표시합니다.
 *
 * 언어 선택은 Figma처럼 지구본 아이콘만 표시하고 `aria-label`을 유지합니다.
 */
export default function HeaderBack({ title }: { title?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [languageOpen, setLanguageOpen] = useState(false);

  const brand = title === undefined;
  const artist = getSelectedArtist();
  const brandLabel = (
    artist
      ? t("app.artistLogo", { name: shortArtistName(artist) })
      : t("app.logo")
  ).normalize("NFC");

  return (
    <>
      <header className={styles.header}>
        <button
          type="button"
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
          type="button"
          className={styles.langButton}
          onClick={() => setLanguageOpen(true)}
          aria-label={t("language.title")}
        >
          <Icon name="earth" size={24} />
        </button>
      </header>

      {languageOpen && <LanguageSheet onClose={() => setLanguageOpen(false)} />}
    </>
  );
}
