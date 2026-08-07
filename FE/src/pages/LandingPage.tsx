import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import ArtistCard from "../components/artist/ArtistCard";
import LanguageSheet from "../components/layout/LanguageSheet";
import Icon from "../components/ui/Icon";
import { PROGRAMS, castOf, searchArtists } from "../data/programs";
import type { Program } from "../data/programs";
import { setSelectedArtist } from "../features/artist/selectedArtist";
import { LOCALE_LABEL, currentLocale } from "../i18n";
import styles from "./LandingPage.module.css";

/**
 * 랜딩 — "당신의 아티스트를 선택하세요".
 *
 * ⚠️ **디자인 확정본에 없는 신규 화면이며, 앱 본편과 의도적으로 다른 다크 테마입니다.**
 *    팔레트만 `--color-primary` 를 공유합니다 (사용자 요청: 기존 레이아웃 무시, 색만 활용).
 *
 * 구성 의도:
 *  - 이 화면의 주인공은 카드가 아니라 **사람**입니다. 흰 카드를 걷어내고 아바타를 키웠습니다.
 *  - 프로그램마다 **대표 3인**만 미리 보여주고, `전체 출연자 보기` 로 그룹(시즌·국가·역할)별
 *    전체 명단을 펼칩니다. 출연자가 90명 넘는 프로그램이 있어 처음부터 다 펼치면
 *    프로그램 목록 자체를 훑을 수 없습니다.
 *  - **이름 검색**을 넣었습니다. 출연자가 300명 가까워서, 이름을 아는 팬에게는
 *    프로그램을 하나씩 펼치는 것보다 이게 유일하게 빠른 경로입니다.
 *  - 탭 즉시 이동시키지 않고 하단 확인 바를 띄웁니다. 오선택 복구가 안 되면 흐름이 끊깁니다.
 */

/** 접힌 상태에서 보여줄 대표 인원. 나머지는 `전체 출연자 보기` 로 넘깁니다. */
const PREVIEW_SIZE = 3;

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = currentLocale();

  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);

  const hits = useMemo(() => searchArtists(query), [query]);
  const searching = query.trim().length > 0;

  const totalArtists = useMemo(() => {
    const all = new Set<string>();
    for (const program of PROGRAMS) {
      for (const name of castOf(program)) all.add(name);
    }
    return all.size;
  }, []);

  function enterFandom() {
    if (!picked) return;
    setSelectedArtist(picked);
    navigate("/home");
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
          {t("landing.stat", {
            programs: PROGRAMS.length,
            artists: totalArtists,
          })}
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
        <div className={styles.programs}>
          {PROGRAMS.map((program) => (
            <ProgramSection
              key={program.id}
              program={program}
              isExpanded={expanded === program.id}
              onToggle={() =>
                setExpanded(expanded === program.id ? null : program.id)
              }
              picked={picked}
              onPick={setPicked}
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

      {languageOpen ? (
        <LanguageSheet onClose={() => setLanguageOpen(false)} />
      ) : null}
    </div>
  );
}

function ProgramSection({
  program,
  isExpanded,
  onToggle,
  picked,
  onPick,
}: {
  program: Program;
  isExpanded: boolean;
  onToggle: () => void;
  picked: string | null;
  onPick: (name: string) => void;
}) {
  const { t } = useTranslation();
  const locale = currentLocale();

  const cast = useMemo(() => castOf(program), [program]);
  const hasCast = cast.length > 0;
  const preview = cast.slice(0, PREVIEW_SIZE);

  return (
    <section>
      <div className={styles.programHead}>
        <div>
          <h2 className={styles.programTitle}>
            {locale === "ko" ? program.title : program.titleEn}
          </h2>
          <p className={styles.programSub}>
            {locale === "ko" ? program.titleEn : program.title}
            {hasCast && ` · ${t("landing.castCount", { count: cast.length })}`}
          </p>
        </div>
        {hasCast && cast.length > PREVIEW_SIZE && (
          <button
            className={styles.programMore}
            onClick={onToggle}
            aria-expanded={isExpanded}
          >
            {isExpanded ? t("landing.collapse") : t("landing.expand")}
          </button>
        )}
      </div>

      {!hasCast && <p className={styles.empty}>{t("landing.noCast")}</p>}

      {hasCast && !isExpanded && (
        <div className={styles.preview}>
          {preview.map((name) => (
            <ArtistCard
              key={name}
              name={name}
              variant="preview"
              selected={picked === name}
              onSelect={onPick}
            />
          ))}
        </div>
      )}

      {hasCast && isExpanded && (
        <div className={styles.groups}>
          {program.groups.map((group) => (
            <div key={group.label}>
              <p className={styles.groupLabel}>
                {locale === "ko" ? group.label : group.labelEn}
              </p>
              <div className={styles.grid}>
                {group.members.map((name) => (
                  <ArtistCard
                    key={name}
                    name={name}
                    variant="grid"
                    selected={picked === name}
                    onSelect={onPick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
