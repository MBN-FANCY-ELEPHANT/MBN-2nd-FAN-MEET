import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { ContentSummary } from "../../api/client";
import { formatCount } from "../../lib/format";
import Icon from "../ui/Icon";
import styles from "./ShortformCard.module.css";

/**
 * 숏폼 카드 (Figma `Carousal (LIVE)` I19:3214;13:125).
 *
 * 기사&롱폼 카드(260×236)와 **완전히 다른 규격**입니다 — 세로 영상이라 164×254 에
 * 썸네일이 190px 로 길고, 제목만 아래 붙습니다. 채널·조회수 메타가 없습니다.
 *
 * ⚠️ 세로 전체화면 플레이어(Figma 19:3365)는 아직 없습니다. 지금은 영상 상세로 갑니다.
 */
export default function ShortformCard({
  content,
}: {
  content: ContentSummary;
}) {
  const { t } = useTranslation();

  return (
    <Link to={`/shorts/${content.id}`} className={styles.card}>
      <div className={styles.thumb}>
        <img src={content.thumbnailUrl} alt="" loading="lazy" />
        {content.live && content.viewerCount != null && (
          <span className={styles.viewers}>
            <Icon name="eye" size={16} className={styles.viewersIcon} />
            {t("content.viewers", { count: formatCount(content.viewerCount) })}
          </span>
        )}
      </div>
      <p className={styles.title}>{content.title}</p>
    </Link>
  );
}
