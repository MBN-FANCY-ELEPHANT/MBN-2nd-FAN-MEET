import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import ContentCard from "../components/content/ContentCard";
import GatheringCard from "../components/gathering/GatheringCard";
import AppHeader from "../components/layout/AppHeader";
import PlaceCard from "../components/play/PlaceCard";
import TipCard from "../components/play/TipCard";
import Icon from "../components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useSpeechRecognition } from "../features/voice/useSpeechRecognition";
import { formatDate } from "../lib/format";
import styles from "./SearchPage.module.css";

/**
 * 검색창 (Figma 22:3900).
 *
 * 셸과 같은 헤더(매일{아티스트} · 언어칩 · 알림벨) + 검색바를 그대로 이어받고,
 * 입력 전에는 **현재 인기있는 검색어 TOP 10** 을 2열 순위로 보여줍니다.
 *
 * ⚠️ 인기 검색어는 BE 계약이 없어 **정적 목록**입니다. 기준 시각도 고정 문구입니다.
 *    검색 자체는 기존 `GET /search` 를 그대로 씁니다.
 */

/** ⚠️ 임시 — 실제 집계가 아닙니다 (Figma 22:3900 의 예시 문구). */
const TRENDING = [
  "티켓팅",
  "한일가왕전",
  "대절",
  "컴백",
  "훠궈",
  "레이저아레나",
  "서울 콘서트",
  "부산 콘서트",
  "영화관",
  "수영장",
];

export default function SearchPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [draft, setDraft] = useState(query);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["search", STAR_ID, query],
    queryFn: () => api.search({ starId: STAR_ID, q: query }),
    enabled: query.trim().length > 0,
  });

  const isEmpty =
    data &&
    !data.contents?.length &&
    !data.schedules?.length &&
    !data.gatherings?.length &&
    !data.places?.length &&
    !data.tips?.length;

  function submit(word: string) {
    const next = word.trim();
    setDraft(next);
    setParams(next ? { q: next } : {});
  }

  /**
   * 검색어 음성 입력 — 음성 도우미와 **같은 훅**을 씁니다.
   *
   * 중장년 사용자에게는 한글 자판이 가장 큰 벽입니다. "박서진 한일가왕전" 을
   * 손으로 치게 하지 말고 말해서 넣게 합니다. 인식이 끝나면 바로 검색까지 실행합니다.
   *
   * ⚠️ 미지원 브라우저·권한 거부면 버튼을 숨깁니다. 눌러도 아무 일 없는 버튼이
   *    남아 있으면 사용자는 앱이 고장 났다고 판단합니다.
   */
  const speech = useSpeechRecognition((text) => submit(text));
  const canUseMic =
    speech.supported && speech.error !== "unsupported" && speech.error !== "denied";

  // 말하는 도중에도 입력창에 실시간으로 쌓입니다 — 인식이 되고 있다는 유일한 신호입니다.
  useEffect(() => {
    if (speech.listening && speech.transcript) setDraft(speech.transcript);
  }, [speech.listening, speech.transcript]);

  return (
    <div className={styles.page}>
      <AppHeader />

      <form
        className={styles.searchBar}
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
      >
        <Icon name="magnifier" size={24} />
        <input
          className={styles.searchInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("app.searchPlaceholder")}
          aria-label={t("search.title")}
          autoFocus
        />
        {draft && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => submit("")}
            aria-label={t("landing.clearSearch")}
          >
            ✕
          </button>
        )}

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
      </form>

      {speech.listening && (
        <p className={styles.voiceHint}>{t("search.voiceListening")}</p>
      )}
      {speech.error === "denied" && (
        <p className={styles.voiceHint}>{t("chat.micDenied")}</p>
      )}

      {!query ? (
        <>
          <h2 className={styles.trendTitle}>{t("search.trendingTitle")}</h2>
          <div className={styles.trendCard}>
            <p className={styles.trendMeta}>{t("search.trendingAsOf")}</p>
            <div className={styles.trendList}>
              {TRENDING.map((word, index) => (
                <button
                  key={word}
                  className={styles.trendItem}
                  onClick={() => submit(word)}
                >
                  <span className={styles.trendRank}>{index + 1}</span>
                  <span className={styles.trendWord}>{word}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.results}>
          {isPending && <LoadingState />}
          {isError && <ErrorState onRetry={() => void refetch()} />}
          {isEmpty && <EmptyState message={t("search.noResult", { query })} />}

          {data && data.contents && data.contents.length > 0 && (
            <div className={styles.resultGroup}>
              <p className={styles.resultGroupTitle}>
                {t("broadcast.articlesAndLongform")}
              </p>
              <div className="scroll-x">
                {data.contents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            </div>
          )}

          {data && data.schedules && data.schedules.length > 0 && (
            <div className={styles.resultGroup}>
              <p className={styles.resultGroupTitle}>
                {t("fanspace.category.concert")}
              </p>
              {data.schedules.map((schedule) => (
                <p key={schedule.id} className={styles.resultRow}>
                  {formatDate(schedule.startAt)} · {schedule.title}
                </p>
              ))}
            </div>
          )}

          {data && data.gatherings && data.gatherings.length > 0 && (
            <div className={styles.resultGroup}>
              <p className={styles.resultGroupTitle}>
                {t("fanspace.category.gathering")}
              </p>
              {data.gatherings.map((gathering) => (
                <GatheringCard key={gathering.id} gathering={gathering} />
              ))}
            </div>
          )}

          {data && data.places && data.places.length > 0 && (
            <div className={styles.resultGroup}>
              <p className={styles.resultGroupTitle}>{t("play.pilgrimage")}</p>
              {data.places.map((place) => (
                <PlaceCard key={place.id} place={place} wide />
              ))}
            </div>
          )}

          {data && data.tips && data.tips.length > 0 && (
            <div className={styles.resultGroup}>
              <p className={styles.resultGroupTitle}>{t("play.cheer")}</p>
              <div className="grid-2">
                {data.tips.map((tip) => (
                  <TipCard key={tip.id} tip={tip} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
