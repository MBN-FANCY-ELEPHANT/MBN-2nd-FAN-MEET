import { useTranslation } from "react-i18next";

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
