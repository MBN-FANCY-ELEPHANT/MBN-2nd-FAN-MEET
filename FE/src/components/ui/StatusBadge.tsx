import { useTranslation } from "react-i18next";

import styles from "./StatusBadge.module.css";

/** 모집 중 / 모집 완료 / 마감 배지 (docs/design-tokens.md §5 상태 배지). */
export default function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span className={`${styles.badge} ${styles[status] ?? ""}`}>
      {t(`gathering.status.${status}`)}
    </span>
  );
}
