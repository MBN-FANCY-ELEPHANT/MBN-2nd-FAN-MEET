import styles from "./ProgressBar.module.css";

/**
 * 모임 참여 진행바.
 *
 * ⚠️ **색만으로 정보를 전달하지 않습니다.** 호출부는 반드시 `34/40` 텍스트를 함께
 * 노출해야 합니다 (docs/design-tokens.md §6 접근성).
 */
export default function ProgressBar({
  current,
  capacity,
}: {
  current: number;
  capacity: number;
}) {
  const ratio = capacity > 0 ? Math.min(current / capacity, 1) : 0;
  const isFull = ratio >= 1;

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={capacity}
    >
      <div
        className={`${styles.fill} ${isFull ? styles.full : ""}`}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
