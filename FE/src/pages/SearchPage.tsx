import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import ContentCard from "../components/content/ContentCard";
import GatheringCard from "../components/gathering/GatheringCard";
import LanguageSheet from "../components/layout/LanguageSheet";
import PlaceCard from "../components/play/PlaceCard";
import TipCard from "../components/play/TipCard";
import Icon from "../components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import {
  getSelectedArtist,
  shortArtistName,
} from "../features/artist/selectedArtist";
import { LOCALE_LABEL, currentLocale } from "../i18n";
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
  "박서진 한일가왕전",
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
  const [languageOpen, setLanguageOpen] = useState(false);
  const query = params.get("q") ?? "";
  const [draft, setDraft] = useState(query);

  const artist = getSelectedArtist();
  const brand = artist
    ? t("app.artistLogo", { name: shortArtistName(artist) })
    : t("app.logo");

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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>{brand}</span>
        <div className={styles.headerActions}>
          <button
            className={styles.langButton}
            onClick={() => setLanguageOpen(true)}
            aria-label={t("language.title")}
          >
            <Icon name="earth" size={16} />
            <span>{LOCALE_LABEL[currentLocale()]}</span>
          </button>
          <button
            className={styles.iconButton}
            aria-label={t("notification.title")}
          >
            <Icon name="notificationBell" size={24} />
          </button>
        </div>
      </header>

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
      </form>

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

      {languageOpen && <LanguageSheet onClose={() => setLanguageOpen(false)} />}
    </div>
  );
}
