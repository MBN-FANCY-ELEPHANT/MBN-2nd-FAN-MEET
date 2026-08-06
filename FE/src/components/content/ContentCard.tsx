import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { ContentSummary } from "../../api/client";
import { contentRoute } from "../../lib/contentRoute";
import {
  formatCount,
  formatDuration,
  formatRelativeTime,
} from "../../lib/format";
import styles from "./ContentCard.module.css";

/**
 * 콘텐츠 카드 (Figma `I2:232;5:344`).
 *
 * **하나의 카드가 세 가지로 갈립니다** — HOME 아카이브 캐러셀이 기사·영상을 섞어서
 * 보여주기 때문입니다 (docs/design-spec.md §2 화면1):
 *
 * | 종류 | 배지 | 좌측 메타 | 우측 메타 | 이동 |
 * |---|---|---|---|---|
 * | 기사 | 기사 | 채널명 | 상대 시각 | `/articles/:id` |
 * | 영상 | 영상 | 재생 시간 | 조회수 | `/videos/:id` |
 * | LIVE | LIVE | — | 👁 시청자 수 | `/videos/:id` |
 */

function useMeta(content: ContentSummary) {
  const { t } = useTranslation();

  if (content.live) {
    return { badge: t("content.badge.live"), left: "", right: "" };
  }
  if (content.type === "ARTICLE") {
    return {
      badge: t("content.badge.article"),
      left: content.channelName,
      right: formatRelativeTime(content.publishedAt),
    };
  }
  return {
    badge: t("content.badge.video"),
    left: formatDuration(content.durationSec),
    right: t("content.views", { count: formatCount(content.viewCount) }),
  };
}

export default function ContentCard({ content }: { content: ContentSummary }) {
  const { t } = useTranslation();
  const meta = useMeta(content);

  return (
    <Link to={contentRoute(content)} className={styles.card}>
      <div className={styles.thumb}>
        <img src={content.thumbnailUrl} alt="" loading="lazy" />
        <span
          className={`${styles.badge} ${content.live ? styles.badgeLive : ""}`}
        >
          {meta.badge}
        </span>
        {content.live && content.viewerCount != null && (
          <span className={styles.viewers}>
            <span aria-hidden>👁</span>
            {t("content.viewers", { count: formatCount(content.viewerCount) })}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.title}>{content.title}</p>
        <div className={styles.meta}>
          <span>{meta.left}</span>
          <span>{meta.right}</span>
        </div>
      </div>
    </Link>
  );
}

/** 2열 그리드용 축소 카드 (Figma `I2:233;3:287`, 164×189). 제목만 노출합니다. */
export function ContentGridCard({ content }: { content: ContentSummary }) {
  const { t } = useTranslation();

  return (
    <Link to={contentRoute(content)} className={styles.gridCard}>
      <div className={styles.gridThumb}>
        <img src={content.thumbnailUrl} alt="" loading="lazy" />
        {content.live && (
          <span className={`${styles.badge} ${styles.badgeLive}`}>
            {t("content.badge.live")}
          </span>
        )}
      </div>
      <div className={styles.gridBody}>
        <p className={styles.gridTitle}>{content.title}</p>
      </div>
    </Link>
  );
}
