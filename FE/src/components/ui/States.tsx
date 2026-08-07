import { useTranslation } from "react-i18next";

import { MASCOT } from "../../features/voice/mascot";
import styles from "./States.module.css";

/**
 * 로딩 / 에러 공통 표시.
 *
 * 네트워크가 흔들려도 **화면이 빈 채로 멈추지 않게** 하는 것이 목적입니다 —
 * 시연 중 원인을 알 수 없는 빈 화면이 가장 나쁩니다.
 */

export function LoadingState() {
  const { t } = useTranslation();
  return <p className={styles.message}>{t("app.loading")}</p>;
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.message}>
      <p>{t("app.error")}</p>
      {onRetry && (
        <button className={styles.retry} onClick={onRetry}>
          {t("chat.retry")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className={styles.message}>{message}</p>;
}

/**
 * 마스코트를 세운 빈 상태 (Figma 22:4214 — "진행중인 투표가 없어요").
 *
 * 목록이 비었을 때 한 줄 텍스트만 두면 화면이 고장 난 것처럼 보입니다.
 * 비엔이가 서 있으면 "지금은 없다"가 의도된 상태로 읽힙니다.
 */
export function EmptyMascotState({ message }: { message: string }) {
  return (
    <div className={styles.emptyMascot}>
      {MASCOT.banner && <img src={MASCOT.banner} alt="" aria-hidden />}
      <p>{message}</p>
    </div>
  );
}
