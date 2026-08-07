import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import Icon from "../components/ui/Icon";
import { findLiveVideo } from "../data/live";
import styles from "./LivePlayerPage.module.css";

/**
 * 가로 영상 플레이어 (Figma 27:6368 — 812×375 가로).
 *
 * 메인의 LIVE 배너를 탭하면 여기로 옵니다. 배너는 **음소거 자동재생**이었지만
 * 여기서는 사용자가 직접 들어온 것이므로 **소리를 켜고** 컨트롤도 노출합니다
 * (브라우저 자동재생 정책상 소리는 사용자 제스처 뒤에만 켤 수 있습니다).
 *
 * ⚠️ 가로 화면입니다. 세로로 들고 있으면 회전 안내를 띄웁니다 —
 *    화면 회전을 강제할 방법이 웹에는 없습니다 (Screen Orientation API 는 전체화면 + 일부
 *    브라우저 한정이라 데모에서 믿을 수 없습니다).
 */
export default function LivePlayerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const video = findLiveVideo(Number(id));

  if (!video) {
    return (
      <div className={styles.page}>
        <p className={styles.notice}>{t("list.empty")}</p>
      </div>
    );
  }

  const embed =
    `https://www.youtube.com/embed/${video.youtubeId}` +
    // 사용자가 직접 연 화면이라 소리를 켭니다. controls=1 로 재생바도 노출합니다.
    `?autoplay=1&controls=1&modestbranding=1&playsinline=1&rel=0`;

  return (
    <div className={styles.page}>
      <div className={styles.stage}>
        <iframe
          className={styles.player}
          src={embed}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>

      <button
        className={styles.close}
        onClick={() => navigate(-1)}
        aria-label={t("app.back")}
      >
        <Icon name="arrowLeft" size={24} className={styles.closeIcon} />
      </button>

      <div className={styles.meta}>
        <p className={styles.title}>{video.title}</p>
        <p className={styles.channel}>{video.channelName}</p>
      </div>

      <p className={styles.rotateHint}>{t("live.rotateHint")}</p>
    </div>
  );
}
