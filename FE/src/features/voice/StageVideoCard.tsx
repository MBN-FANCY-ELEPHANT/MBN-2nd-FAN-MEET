import { useTranslation } from "react-i18next";

import Icon from "../../components/ui/Icon";
import styles from "./VoiceAssistant.module.css";

/**
 * "이찬원 무대 보여줘" 의 답 — 음성 시트 안에서 바로 재생되는 롱폼 카드.
 *
 * ⚠️ **주소는 서버 DB(`artist_stage`)에서 옵니다.** AI 가 만든 주소가 아닙니다.
 *    모델에게 YouTube 주소를 생성시키면 없는 영상이나 임베드 차단 영상이 나오고,
 *    임베드 차단 영상은 오류 없이 **검은 화면 + 스피너**만 남깁니다.
 *
 * ⚠️ 시드를 교체할 때는 **반드시 이 iframe 안에서** 재생을 확인하세요.
 *    주소창에 embed URL 을 직접 여는 검증은 무의미합니다 (정상 영상도 오류 153).
 */
export default function StageVideoCard({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const { t } = useTranslation();

  return (
    <section className={styles.stageVideo}>
      <div className={styles.stageVideoHead}>
        <Icon name="youtube" size={20} />
        <span className={styles.stageVideoLabel}>
          {t("voice.action.videoLabel")}
        </span>
      </div>

      <div className={styles.stageVideoFrame}>
        <iframe
          src={`${url}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <p className={styles.stageVideoTitle}>{title}</p>
    </section>
  );
}
