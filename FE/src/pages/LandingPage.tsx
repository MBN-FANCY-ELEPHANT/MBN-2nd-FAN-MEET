import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import ArtistCard from "../components/artist/ArtistCard";
import LanguageSheet from "../components/layout/LanguageSheet";
import Icon from "../components/ui/Icon";
import {
  allArtists,
  isSelectableArtist,
  searchArtists,
} from "../data/programs";
import { setSelectedArtist } from "../features/artist/selectedArtist";
import NicknameDraw from "../features/auth/NicknameDraw";
import { LOCALE_LABEL, currentLocale } from "../i18n";
import styles from "./LandingPage.module.css";

/**
 * 랜딩 — "당신의 아티스트를 선택하세요".
 *
 * ⚠️ **디자인 확정본에 없는 신규 화면이며, 앱 본편과 의도적으로 다른 다크 테마입니다.**
 *    팔레트만 `--color-primary` 를 공유합니다.
 *
 * 구성 의도:
 *  - 이 화면의 주인공은 카드가 아니라 **사람**입니다. 흰 카드를 걷어내고 아바타만 띄웠습니다.
 *  - **프로그램별로 묶지 않습니다.** 팬은 "어느 프로그램에 나왔는지"가 아니라 이름으로
 *    사람을 찾습니다. 전 출연자를 합쳐 **가나다순 3열 그리드**로 한 번에 뿌립니다.
 *  - **이름 검색**을 함께 둡니다. 274명을 끝까지 스크롤하는 것보다 빠릅니다.
 *  - 탭 즉시 이동시키지 않고 하단 확인 바를 띄웁니다. 오선택 복구가 안 되면 흐름이 끊깁니다.
 */
export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = currentLocale();

  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  // 아티스트를 고르면 닉네임 추첨(로그인 대체)이 뜨고, 확인하면 메인으로 갑니다.
  const [drawFor, setDrawFor] = useState<string | null>(null);

  const artists = useMemo(() => allArtists(), []);
  const hits = useMemo(() => searchArtists(query), [query]);
  const searching = query.trim().length > 0;

  function enterFandom() {
    if (!picked) return;
    setSelectedArtist(picked);
    // 바로 넘어가지 않고 닉네임 추첨을 먼저 띄웁니다 (로그인 대체 연출).
    setDrawFor(picked);
  }

  return (
    <div className={styles.page}>
      <div className={styles.topline}>
        <span className={styles.wordmark}>{t("app.logo")}</span>
        <button
          className={styles.langButton}
          onClick={() => setLanguageOpen(true)}
          aria-label={t("language.title")}
        >
          <Icon name="earth" size={14} className={styles.iconLight} />
          <span>{LOCALE_LABEL[locale]}</span>
        </button>
      </div>

      <div className={styles.hero}>
        <span className={styles.eyebrow}>{t("landing.eyebrow")}</span>
        <h1 className={styles.heroTitle}>
          {/* 줄 단위로 나눕니다 — 어순이 다른 언어에서 한 문장을 색으로 쪼개면 깨집니다 */}
          <span className={styles.heroAccent}>{t("landing.titleLine1")}</span>
          <br />
          {t("landing.titleLine2")}
        </h1>
        <p className={styles.heroSub}>{t("landing.subtitle")}</p>
        <p className={styles.heroStat}>
          {t("landing.stat", { artists: artists.length })}
        </p>
      </div>

      <div className={styles.searchWrap}>
        <div className={styles.search}>
          <Icon name="magnifier" size={18} className={styles.iconLight} />
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("landing.searchPlaceholder")}
            aria-label={t("landing.searchPlaceholder")}
          />
          {searching && (
            <button
              className={styles.searchClear}
              onClick={() => setQuery("")}
              aria-label={t("landing.clearSearch")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {searching ? (
        <>
          <p className={styles.resultHead}>
            {t("landing.resultCount", { count: hits.length })}
          </p>
          {hits.length > 0 ? (
            <div className={styles.resultList}>
              {hits.map((hit) => (
                <ArtistCard
                  key={hit.name}
                  name={hit.name}
                  variant="row"
                  meta={hit.programs.join(" · ")}
                  selected={picked === hit.name}
                  disabled={!isSelectableArtist(hit.name)}
                  onSelect={setPicked}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              {t("search.noResult", { query: query.trim() })}
            </p>
          )}
        </>
      ) : (
        <div className={styles.artistGrid}>
          {artists.map((name) => (
            <ArtistCard
              key={name}
              name={name}
              variant="preview"
              selected={picked === name}
              disabled={!isSelectableArtist(name)}
              onSelect={setPicked}
            />
          ))}
        </div>
      )}

      {picked && (
        <div className={styles.confirmBar}>
          <span className={styles.confirmText}>
            <span className={styles.confirmLabel}>
              {t("landing.confirmLabel")}
            </span>
            <span className={styles.confirmName}>{picked}</span>
          </span>
          <button className={styles.confirmButton} onClick={enterFandom}>
            {t("landing.enter")}
          </button>
        </div>
      )}

      {drawFor && (
        <NicknameDraw artist={drawFor} onDone={() => navigate("/home")} />
      )}

      {languageOpen ? (
        <LanguageSheet onClose={() => setLanguageOpen(false)} />
      ) : null}
    </div>
  );
}
