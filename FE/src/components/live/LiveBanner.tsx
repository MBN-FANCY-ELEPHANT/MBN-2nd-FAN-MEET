import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { liveThumbnail, livePlaylist } from "../../data/live";
import styles from "./LiveBanner.module.css";
import { useYouTubePlayer } from "./useYouTubePlayer";

/**
 * 메인 상단 LIVE 배너 — 아티스트 무대 영상이 **계속 재생되는** 섹션
 * (Figma 27:6025, 디자이너 주석 "짜집기 영상 인터렉션").
 *
 * <b>왜 YouTube 임베드인가</b>
 *  - 무대 영상 자체 호스팅은 저작권 문제로 컷된 결정입니다 (docs/mvp-scope.md).
 *  - IFrame Player API 는 **API 키가 필요 없습니다.** 영상 ID 만 있으면 됩니다.
 *
 * ⚠️ **자동재생은 음소거가 필수입니다.** 브라우저 정책이라 우회할 수 없습니다.
 *    배너는 소리 없이 돌고, 탭하면 가로 플레이어에서 소리가 켜집니다.
 *
 * ⚠️ 포스터는 **그 영상의 유튜브 썸네일**입니다. 고정 이미지를 쓰면 아티스트를 바꿔도
 *    포스터가 그대로라 재생 전까지 남의 그림이 보입니다 (실제로 겪음).
 *
 * ⚠️ 포스터를 영상 **위에** 덮고 `playing` 이 true 가 되어야 걷습니다.
 *    타이머로 걷었더니 버퍼링이 길 때 검은 화면과 스피너가 노출됐습니다.
 *    임베드가 막히거나 네트워크가 끊기면 `playing` 이 영영 false 라 포스터가 그대로
 *    남습니다 — 그게 곧 폴백입니다.
 */
export default function LiveBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // 목록이 비면 배너 자체를 접습니다. 훅은 조건부로 부를 수 없으므로 빈 id 를 넘겨
  // 플레이어 생성을 건너뛰게 합니다.
  // 선택한 아티스트의 재생목록에서 첫 영상을 씁니다.
  const video = livePlaylist().at(0);
  const { mountRef, playing } = useYouTubePlayer(video?.youtubeId ?? "");

  if (!video) return null;

  return (
    <button
      className={styles.banner}
      onClick={() => navigate(`/live/${video.id}`)}
      aria-label={t("live.openPlayer")}
    >
      <div className={styles.playerWrap} aria-hidden>
        <div ref={mountRef} className={styles.player} />
      </div>

      <img
        className={`${styles.poster} ${playing ? styles.posterHidden : ""}`}
        src={liveThumbnail(video)}
        alt=""
        aria-hidden
      />

      <span className={styles.scrim} aria-hidden />

      <span className={styles.liveBadge}>{t("live.badge")}</span>

      <span className={styles.caption}>
        <span className={styles.captionSub}>{t("live.subtitle")}</span>
        <span className={styles.captionTitle}>{t("live.title")}</span>
      </span>
    </button>
  );
}
