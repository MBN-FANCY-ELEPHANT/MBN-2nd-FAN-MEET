import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import type { ContentSummary } from "../api/client";
import { getSelectedStarId } from "../features/artist/selectedArtist";
import HeaderBack from "../components/layout/HeaderBack";
import TabBar from "../components/ui/TabBar";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { formatCount, formatDuration, formatRelativeTime } from "../lib/format";
import styles from "./ContentListPage.module.css";

/**
 * 기사&롱폼 전체보기 (Figma 19:3328 기사 뷰 / 19:3315 롱폼 뷰).
 *
 * 방송 탭의 `전체보기` 목적지입니다. **두 뷰의 레이아웃이 완전히 다릅니다** —
 *  - 기사: 정사각 썸네일 2열 그리드, 제목만
 *  - 롱폼: 화면 폭을 꽉 채운 16:9 썸네일 + 채널 아바타 + 제목 + 메타 (유튜브형)
 *
 * ⚠️ 이전에는 Chip 필터 하나로 전체/기사/영상/LIVE 를 걸렀는데, 디자인 2차본에서
 *    **밑줄 탭 2종**으로 바뀌면서 목록 형태 자체가 갈렸습니다.
 */

const TABS = ["article", "longform"] as const;
type Tab = (typeof TABS)[number];

export default function ContentListPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  // 방송 탭의 어느 섹션에서 눌렀는지에 따라 시작 탭이 갈립니다
  const [tab, setTab] = useState<Tab>(
    params.get("tab") === "longform" ? "longform" : "article",
  );

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["contents", getSelectedStarId(), tab],
    queryFn: () =>
      api.getContents({
        starId: getSelectedStarId(),
        size: 50,
        type: tab === "article" ? "ARTICLE" : "VIDEO",
      }),
  });

  const items = data?.content ?? [];

  return (
    <div className={styles.page}>
      <HeaderBack />
      <div className={styles.body}>
        <TabBar
          options={TABS.map((value) => ({
            value,
            label: t(`broadcast.tab.${value}`),
          }))}
          value={tab}
          onChange={setTab}
        />

        {isPending && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {data && items.length === 0 && <EmptyState message={t("list.empty")} />}

        {items.length > 0 &&
          (tab === "article" ? (
            <div className={styles.articleGrid}>
              {items.map((content) => (
                <ArticleGridCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className={styles.longformList}>
              {items.map((content) => (
                <LongformRow key={content.id} content={content} />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

function ArticleGridCard({ content }: { content: ContentSummary }) {
  return (
    <Link to={`/articles/${content.id}`} className={styles.articleCard}>
      <img
        className={styles.articleThumb}
        src={content.thumbnailUrl}
        alt=""
        loading="lazy"
      />
      <p className={styles.articleTitle}>{content.title}</p>
    </Link>
  );
}

function LongformRow({ content }: { content: ContentSummary }) {
  const { t } = useTranslation();

  // `MBN NEWS · 조회 수 2.7만회 · 3주 전` (Figma 19:3315)
  const meta = [
    content.channelName,
    t("content.views", { count: formatCount(content.viewCount) }),
    formatRelativeTime(content.publishedAt),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link to={`/videos/${content.id}`} className={styles.longformItem}>
      <div className={styles.longformThumbWrap}>
        <img
          className={styles.longformThumb}
          src={content.thumbnailUrl}
          alt=""
          loading="lazy"
        />
        {content.durationSec != null && (
          <span className={styles.duration}>
            {formatDuration(content.durationSec)}
          </span>
        )}
      </div>
      <div className={styles.longformBody}>
        {/* ⚠️ `ContentSummary` 에 채널 로고 URL 이 없습니다 (목록 응답에 미포함).
            디자인은 MBN 로고인데 에셋이 없어 채널명 첫 글자로 대체했습니다. */}
        <span className={styles.channelAvatar} aria-hidden>
          {content.channelName ? Array.from(content.channelName)[0] : "M"}
        </span>
        <div className={styles.longformText}>
          <p className={styles.longformTitle}>{content.title}</p>
          <p className={styles.longformMeta}>{meta}</p>
        </div>
      </div>
    </Link>
  );
}
