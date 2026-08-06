import type { Place } from "../../api/client";
import styles from "./PlayCard.module.css";

/**
 * 성지순례 카드.
 *
 * `wide` 는 전체보기 목록에서 세로로 쌓을 때 씁니다 — 가로 캐러셀에서는 260px 고정,
 * 목록에서는 폭을 꽉 채웁니다.
 *
 * ⚠️ **정책**: 지도를 임베드하지 않고 `mapUrl` 외부 링크로만 연결합니다.
 * 스타의 실시간 위치·사적 동선은 절대 노출하지 않으며, 등록된 장소는 전부
 * `sourceUrl`(공개 출처)이 있는 것들입니다 (docs/domain-model.md → Place).
 */
export default function PlaceCard({
  place,
  wide = false,
}: {
  place: Place;
  wide?: boolean;
}) {
  return (
    <a
      className={`${styles.place} ${wide ? styles.placeWide : ""}`}
      href={place.mapUrl ?? place.sourceUrl}
      target="_blank"
      rel="noreferrer noopener"
    >
      <div className={styles.thumb}>
        <img src={place.imageUrl} alt="" loading="lazy" />
      </div>
      <div className={styles.body}>
        <p className={styles.name}>{place.name}</p>
        <p className={styles.context}>{place.visitContext ?? place.address}</p>
      </div>
    </a>
  );
}
