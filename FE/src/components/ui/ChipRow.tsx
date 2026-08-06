import styles from "./Chip.module.css";

/**
 * 필터 칩 줄 (Figma 2:1228 Chip — Default / Selected).
 *
 * 목록 화면의 카테고리 필터에 씁니다. 디자인에 컴포넌트만 있고 배치된 화면이 없어서,
 * 전체보기 목록 화면을 만들면서 여기에 적용했습니다.
 */
export type ChipOption<T extends string> = { value: T; label: string };

export default function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.row} role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={option.value === value}
          className={`${styles.chip} ${option.value === value ? styles.selected : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
