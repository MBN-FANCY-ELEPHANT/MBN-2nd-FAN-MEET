import styles from "./TabBar.module.css";

/**
 * 밑줄 탭바 (Figma 22:4266).
 *
 * `ChipRow` 와 달리 **화면 안에서 뷰를 갈아끼우는** 용도입니다 —
 * 기사&롱폼 전체보기(기사/롱폼)와 팬공간(공연/투표/굿즈/모집)이 씁니다.
 */
export type TabOption<T extends string> = { value: T; label: string };

export default function TabBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.bar} role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={option.value === value}
          className={`${styles.tab} ${option.value === value ? styles.tabActive : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          <span className={styles.underline} aria-hidden />
        </button>
      ))}
    </div>
  );
}
