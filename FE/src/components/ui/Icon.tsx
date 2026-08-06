import aiSquare from "../../assets/icons/ai-square.svg";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import calendar from "../../assets/icons/calendar.svg";
import earth from "../../assets/icons/earth.svg";
import heart from "../../assets/icons/heart.svg";
import magnifier from "../../assets/icons/magnifier.svg";
import mapMarker from "../../assets/icons/map-marker.svg";
import mic from "../../assets/icons/mic.svg";
import translate from "../../assets/icons/translate.svg";
import wallet from "../../assets/icons/wallet.svg";

/**
 * Figma 에서 내보낸 실제 아이콘 (Neaticons / mingcute).
 *
 * ⚠️ 아이콘을 직접 `<svg>` 로 그리지 마세요 — 원본 벡터 데이터가 없으므로 손으로 그린 것은
 * 반드시 디자인과 달라집니다. Figma 에셋을 받아 커밋한 뒤 여기에 등록하세요
 * (docs/component-map.md §8).
 *
 * 크기는 **너비·높이를 모두 명시**합니다. `auto` 로 두면 원본 크기로 튀어나옵니다.
 */
const SOURCES = {
  aiSquare,
  arrowLeft,
  calendar,
  earth,
  heart,
  magnifier,
  mapMarker,
  mic,
  translate,
  wallet,
} as const;

export type IconName = keyof typeof SOURCES;

export default function Icon({
  name,
  size = 24,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={SOURCES[name]}
      alt=""
      aria-hidden
      width={size}
      height={size}
      style={{ width: size, height: size, flexShrink: 0, display: "block" }}
    />
  );
}
