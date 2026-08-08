import aiSquare from "../../assets/icons/ai-square.svg";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import arrowRight from "../../assets/icons/arrow-right.svg";
import calendar from "../../assets/icons/calendar.svg";
import eye from "../../assets/icons/eye.svg";
import chatBubble from "../../assets/icons/chat-bubble.svg";
import earth from "../../assets/icons/earth.svg";
import heart from "../../assets/icons/heart.svg";
import heartFilled from "../../assets/icons/heart-filled.svg";
import heartOutline from "../../assets/icons/heart-outline.svg";
import magnifier from "../../assets/icons/magnifier.svg";
import mapMarker from "../../assets/icons/map-marker.svg";
import megaphone from "../../assets/icons/megaphone.svg";
import mic from "../../assets/icons/mic.svg";
import notificationBell from "../../assets/icons/notification-bell.svg";
import radioOff from "../../assets/icons/radio-off.svg";
import radioOn from "../../assets/icons/radio-on.svg";
import share from "../../assets/icons/share.svg";
import translate from "../../assets/icons/translate.svg";
import wallet from "../../assets/icons/wallet.svg";
import youtube from "../../assets/icons/youtube.svg";

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
  arrowRight,
  calendar,
  chatBubble,
  earth,
  eye,
  heart,
  heartFilled,
  heartOutline,
  magnifier,
  mapMarker,
  megaphone,
  mic,
  notificationBell,
  radioOff,
  radioOn,
  share,
  translate,
  wallet,
  youtube,
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
