import { Link } from "react-router-dom";

import type { TipSummary } from "../../api/client";
import { formatDate } from "../../lib/format";
import styles from "./PlayCard.module.css";

/** 응원하기 카드 (PLAY 탭 2열 그리드). */
export default function TipCard({ tip }: { tip: TipSummary }) {
  return (
    <Link to={`/play/tips/${tip.id}`} className={styles.tip}>
      <div className={styles.tipThumb}>
        <img src={tip.thumbnailUrl} alt="" loading="lazy" />
      </div>
      <div className={styles.tipBody}>
        <p className={styles.tipTitle}>{tip.title}</p>
        {/* 투표·스밍 정책은 자주 바뀝니다. 갱신일이 곧 신뢰도입니다 */}
        <p className={styles.updated}>{formatDate(tip.updatedAt)}</p>
      </div>
    </Link>
  );
}
