import exampleProfile from "../../assets/example/example_profile.png";
import styles from "./ArtistCard.module.css";

/**
 * 아티스트 아바타 카드 (랜딩 전용).
 *
 * ⚠️ **프로필 사진은 전원이 같은 예시 이미지 1장을 공유합니다.**
 *    실제 출연자 사진이 아니라 레이아웃 확인용 플레이스홀더입니다
 *    (`src/assets/example/example_profile.png`). 실제 사진이 확보되면
 *    `Program` 데이터에 출연자별 `imageUrl` 을 추가하고 여기 `src` 만 바꾸세요.
 *    **외부 공개 전에는 반드시 교체해야 합니다** — 실존 인물 사진이 다른 사람 이름으로
 *    표시되는 상태입니다.
 */

const PLACEHOLDER_PROFILE = exampleProfile;

type Props = {
  name: string;
  /** preview: 아티스트 그리드 · row: 검색 결과 */
  variant: "preview" | "row";
  selected?: boolean;
  /** row 에서만 씁니다 — 출연 프로그램 등 보조 정보 */
  meta?: string;
  onSelect: (name: string) => void;
};

export default function ArtistCard({
  name,
  variant,
  selected = false,
  meta,
  onSelect,
}: Props) {
  const avatar = (
    <span className={styles.avatar}>
      {/* ⚠️ 랜딩이 274명을 한 화면에 뿌립니다. 지연 로딩·비동기 디코딩이 없으면
          초기 렌더에서 브라우저가 눈에 띄게 버벅입니다 (실제로 겪음). */}
      <img
        src={PLACEHOLDER_PROFILE}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
      />
      {selected && (
        <span className={styles.check} aria-hidden>
          ✓
        </span>
      )}
    </span>
  );

  if (variant === "row") {
    return (
      <button
        type="button"
        className={`${styles.card} ${styles.row} ${selected ? styles.selected : ""}`}
        onClick={() => onSelect(name)}
        aria-pressed={selected}
      >
        {avatar}
        <span className={styles.resultText}>
          <span className={styles.rowName}>{name}</span>
          {meta && <span className={styles.rowMeta}>{meta}</span>}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.card} ${styles[variant]} ${selected ? styles.selected : ""}`}
      onClick={() => onSelect(name)}
      aria-pressed={selected}
    >
      {avatar}
      <span className={styles.name} title={name}>
        {name}
      </span>
    </button>
  );
}
