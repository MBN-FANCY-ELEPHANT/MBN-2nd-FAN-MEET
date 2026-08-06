import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import ru from "./locales/ru.json";
import zh from "./locales/zh.json";

/**
 * 지원 언어 7종. 배열 순서가 언어 선택 Bottom Sheet 의 표시 순서입니다
 * (디자인 화면 6:1056 과 동일한 순서).
 *
 * ⚠️ 번역 검수는 ko/en 만 합니다. 나머지 5개는 AI 생성 결과를 그대로 씁니다
 *    (docs/mvp-scope.md 결정 사항).
 * ⚠️ 새 문구는 7개 파일 **전부**에 추가하세요. 한쪽만 추가하면 언어 전환 시 키가 그대로 노출됩니다.
 */
export const SUPPORTED_LOCALES = [
  "en",
  "ko",
  "fr",
  "ja",
  "es",
  "zh",
  "ru",
] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** 각 언어의 자기 표기(endonym). 언어 선택 화면에서는 번역하지 않는 것이 관례입니다. */
export const LOCALE_LABEL: Record<SupportedLocale, string> = {
  en: "English",
  ko: "한국어",
  fr: "Français",
  ja: "日本語",
  es: "Español",
  zh: "简体中文",
  ru: "Русский",
};

/** 서버 요청의 Accept-Language, Web Speech API 의 recognition.lang 에 사용합니다. */
export const LOCALE_BCP47: Record<SupportedLocale, string> = {
  en: "en-US",
  ko: "ko-KR",
  fr: "fr-FR",
  ja: "ja-JP",
  es: "es-ES",
  zh: "zh-CN",
  ru: "ru-RU",
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
      fr: { translation: fr },
      ja: { translation: ja },
      es: { translation: es },
      zh: { translation: zh },
      ru: { translation: ru },
    },
    fallbackLng: "ko",
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "trot.locale",
    },
  });

export function currentLocale(): SupportedLocale {
  const resolved = i18n.resolvedLanguage as SupportedLocale | undefined;
  return resolved && SUPPORTED_LOCALES.includes(resolved) ? resolved : "ko";
}

export default i18n;
