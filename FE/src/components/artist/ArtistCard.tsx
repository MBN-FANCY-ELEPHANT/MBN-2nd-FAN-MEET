import { artistImage } from "../../data/programs";
import styles from "./ArtistCard.module.css";

/**
 * 아티스트 아바타 카드 (랜딩 전용).
 *
 * ⚠️ **프로필은 `public/artists/<slug>/profile.png` 에서 옵니다.**
 *    BE 의 `star.profileImageUrl` 을 쓰지 않는 이유: 랜딩은 로그인 이전 첫 화면이라
 *    API 의존을 만들면 BE 가 흔들릴 때 **데모가 시작부터 깨집니다.**
 *
 * ⚠️ 파일이 아직 없으면 `onError` 로 예시 이미지에 폴백합니다.
 *    **외부 공개 전에는 반드시 실제 이미지로 채워야 합니다** — 지금은 세 사람이
 *    같은 그림으로 보일 수 있습니다.
 */

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
        src={artistImage(name, "profile.png")}
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
