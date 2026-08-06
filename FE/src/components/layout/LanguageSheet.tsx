import { useTranslation } from "react-i18next";

import { LOCALE_LABEL, SUPPORTED_LOCALES, currentLocale } from "../../i18n";
import BottomSheet from "../ui/BottomSheet";
import styles from "./LanguageSheet.module.css";

/**
 * 언어 선택 Bottom Sheet (Figma 6:1056).
 *
 * 항목은 각 언어의 자기 표기로 노출합니다 — 현재 UI 언어를 모르는 사용자도 자기 언어를
 * 찾을 수 있어야 하기 때문입니다.
 *
 * 언어를 바꾸면 UI 문자열뿐 아니라 AI 응답·분석·댓글 번역 언어도 함께 바뀝니다
 * (api 클라이언트가 Accept-Language 를 현재 로케일로 보냅니다).
 */
export default function LanguageSheet({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const active = currentLocale();

  return (
    <BottomSheet title={t("language.title")} onClose={onClose}>
      <div className={styles.list}>
        {SUPPORTED_LOCALES.map((locale) => (
          <button
            key={locale}
            className={`${styles.item} ${locale === active ? styles.itemActive : ""}`}
            onClick={() => {
              void i18n.changeLanguage(locale);
              onClose();
            }}
          >
            {LOCALE_LABEL[locale]}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
