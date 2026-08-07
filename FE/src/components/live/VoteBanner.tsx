import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import voteBanner from "../../assets/example/example_banner_fanSpace.png";
import styles from "./VoteBanner.module.css";

/**
 * 팬공간 상단 배너 — **진행 중인 투표**로 보냅니다 (Figma 27:5115).
 *
 * 메인의 LIVE 스트리밍 배너와 같은 자리·같은 크기지만 성격이 다릅니다.
 * 팬공간은 "참여"가 목적이라 영상이 아니라 지금 참여할 수 있는 투표를 띄웁니다.
 *
 * ⚠️ 투표 도메인이 BE 에 없어 배너 이미지·문구가 정적입니다 (개편 3단계에서 계약 추가).
 */
export default function VoteBanner() {
  const { t } = useTranslation();

  return (
    <Link to="/fanspace/vote" className={styles.banner}>
      <img src={voteBanner} alt="" aria-hidden className={styles.image} />
      <span className={styles.scrim} aria-hidden />
      <span className={styles.badge}>{t("live.badge")}</span>
      <span className={styles.caption}>
        <span className={styles.captionSub}>{t("vote.bannerSub")}</span>
        <span className={styles.captionTitle}>{t("vote.bannerCta")}</span>
      </span>
    </Link>
  );
}
