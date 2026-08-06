import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { GatheringPage } from "../../api/client";
import { formatDeadline } from "../../lib/format";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import styles from "./GatheringCard.module.css";

export type GatheringSummary = NonNullable<GatheringPage["content"]>[number];
type Gathering = GatheringSummary;

/**
 * 모임 카드 (Figma 6:751 내부, 343×352).
 *
 * COMMUNITY 세로 리스트에서 씁니다. 디자인에서 정보 밀도가 가장 높은 컴포넌트입니다.
 */
export default function GatheringCard({ gathering }: { gathering: Gathering }) {
  const { t } = useTranslation();

  return (
    <Link to={`/community/gatherings/${gathering.id}`} className={styles.card}>
      <div className={styles.cover}>
        <img src={gathering.coverImageUrl} alt="" loading="lazy" />
      </div>

      <div className={styles.body}>
        <StatusBadge status={gathering.status} />
        <p className={styles.title}>{gathering.title}</p>
        <p className={styles.summary}>{gathering.summary}</p>

        <div className={styles.progressLabel}>
          <span>{t("gathering.participants")}</span>
          {/* 진행바 색만으로 정보를 전달하지 않도록 숫자를 항상 함께 노출합니다 */}
          <span>
            {t("gathering.progress", {
              current: gathering.currentCount,
              capacity: gathering.capacity,
            })}
          </span>
        </div>
        <ProgressBar
          current={gathering.currentCount}
          capacity={gathering.capacity}
        />

        <div className={styles.footer}>
          <span className={styles.host}>
            {gathering.official && <span className={styles.official}>MBN</span>}
            {gathering.hostNickname}
          </span>
          <span>{formatDeadline(gathering.deadline)}</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * HOME 2열 그리드용 축소 카드 (Figma `I2:233;3:287`, 164×189).
 *
 * COMMUNITY 세로 카드와 **역할이 다릅니다** — HOME 은 추천 4건을 훑어보는 자리라
 * 진행률·호스트를 생략하고 이미지와 제목만 보여줍니다 (docs/mvp-scope.md §4 이슈 2).
 */
export function GatheringGridCard({ gathering }: { gathering: Gathering }) {
  return (
    <Link
      to={`/community/gatherings/${gathering.id}`}
      className={styles.gridCard}
    >
      <div className={styles.gridCover}>
        <img src={gathering.coverImageUrl} alt="" loading="lazy" />
      </div>
      <div className={styles.gridBody}>
        <p className={styles.gridTitle}>{gathering.title}</p>
      </div>
    </Link>
  );
}
