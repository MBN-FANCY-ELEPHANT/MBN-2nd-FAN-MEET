import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import HeaderBack from "../components/layout/HeaderBack";
import Icon from "../components/ui/Icon";
import { useToast } from "../components/ui/useToast";
import {
  MAX_KEYWORDS,
  SUGGESTED_KEYWORDS,
  addKeyword,
  listKeywords,
  removeKeyword,
} from "../features/notification/keywords";
import { useSpeechRecognition } from "../features/voice/useSpeechRecognition";
import styles from "./NotificationKeyword.module.css";

/**
 * 알림 키워드 등록 (알림 드로어의 「키워드 등록」 목적지).
 *
 * 등록한 단어가 제목에 들어간 소식이 올라오면 알려줍니다.
 *
 * 입력에 **음성 마이크**를 붙였습니다 — 검색창과 같은 이유입니다. 중장년 사용자에게
 * 한글 자판이 가장 큰 벽이고, 키워드는 한두 단어라 음성이 특히 잘 맞습니다.
 *
 * ⚠️ 키워드는 **이 기기 로컬 저장**이고 실제 푸시 알림은 아직 없습니다
 *    (`features/notification/keywords.ts` 주석 참고).
 */
export default function NotificationKeywordPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [keywords, setKeywords] = useState(listKeywords);
  const [draft, setDraft] = useState("");

  const full = keywords.length >= MAX_KEYWORDS;

  function add(word: string) {
    const trimmed = word.trim();
    if (!trimmed) return;

    if (full) {
      toast("info", t("notification.keywordFull", { max: MAX_KEYWORDS }));
      return;
    }
    // 중복은 조용히 무시하면 "등록 눌렀는데 아무 일도 안 일어나는" 화면이 됩니다.
    if (keywords.includes(trimmed)) {
      toast("info", t("notification.keywordDuplicate"));
      setDraft("");
      return;
    }

    setKeywords(addKeyword(trimmed));
    setDraft("");
  }

  function remove(word: string) {
    setKeywords(removeKeyword(word));
  }

  // 검색창과 같은 훅. 인식이 끝나면 바로 등록까지 합니다.
  const speech = useSpeechRecognition((text) => add(text));
  const canUseMic =
    speech.supported &&
    speech.error !== "unsupported" &&
    speech.error !== "denied";

  useEffect(() => {
    if (speech.listening && speech.transcript) setDraft(speech.transcript);
  }, [speech.listening, speech.transcript]);

  const unused = SUGGESTED_KEYWORDS.filter((w) => !keywords.includes(w));

  return (
    <div className={styles.page}>
      <HeaderBack />

      <div className={styles.sheet}>
        <h1 className={styles.title}>{t("notification.keywordTitle")}</h1>
        <p className={styles.lead}>{t("notification.keywordLead")}</p>

        <form
          className={styles.inputRow}
          onSubmit={(e) => {
            e.preventDefault();
            add(draft);
          }}
        >
          <input
            className={styles.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("notification.keywordPlaceholder")}
            aria-label={t("notification.keywordTitle")}
            maxLength={20}
          />
          {canUseMic && (
            <button
              type="button"
              className={`${styles.voice} ${speech.listening ? styles.voiceOn : ""}`}
              onClick={() => (speech.listening ? speech.stop() : speech.start())}
              aria-label={t(
                speech.listening ? "search.voiceStop" : "search.voiceStart",
              )}
              aria-pressed={speech.listening}
            >
              <Icon name="mic" size={20} className={styles.voiceIcon} />
            </button>
          )}
          <button className={styles.addButton} type="submit" disabled={full}>
            {t("notification.keywordAdd")}
          </button>
        </form>

        {speech.listening && (
          <p className={styles.listening}>{t("search.voiceListening")}</p>
        )}

        <h2 className={styles.sectionTitle}>
          {t("notification.keywordMine", {
            count: keywords.length,
            max: MAX_KEYWORDS,
          })}
        </h2>

        {keywords.length === 0 ? (
          <p className={styles.empty}>{t("notification.keywordEmpty")}</p>
        ) : (
          <ul className={styles.chips}>
            {keywords.map((word) => (
              <li key={word}>
                <button
                  className={styles.chipOn}
                  onClick={() => remove(word)}
                  aria-label={t("notification.keywordRemove", { word })}
                >
                  <span>{word}</span>
                  <span aria-hidden>✕</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {unused.length > 0 && (
          <>
            <h2 className={styles.sectionTitle}>
              {t("notification.keywordSuggested")}
            </h2>
            <ul className={styles.chips}>
              {unused.map((word) => (
                <li key={word}>
                  <button className={styles.chip} onClick={() => add(word)}>
                    <span aria-hidden>＋</span>
                    <span>{word}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className={styles.notice}>{t("notification.keywordNotice")}</p>
      </div>
    </div>
  );
}
