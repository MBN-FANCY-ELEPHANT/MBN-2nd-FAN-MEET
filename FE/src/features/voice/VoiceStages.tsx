import styles from "./VoiceStages.module.css";

/**
 * 음성 도우미의 단계 상태와 주황 이펙트.
 *
 * ⚠️ **상단 5단계 레일(`VoiceStageRail`)은 걷어냈습니다** (사용자 요청).
 *    단계 자체는 남아 있습니다 — 마이크 비활성화(중복 요청 차단)와 아래 이펙트가
 *    이 값을 씁니다. `voice.step.*` · `voice.stepStatus` 키도 **지우지 않았으니**
 *    레일을 되살리려면 이 파일에 컴포넌트만 되돌리면 됩니다.
 *
 * ⚠️ 이펙트는 **장식이 아니라 상태 신호**입니다. 레일이 사라진 지금은 <b>유일한</b>
 *    진행 신호이기도 합니다 — 단계마다 속도와 확산 거리가 달라서 화면을 안 읽어도
 *    "지금 도는 중"인지 "끝났는지"를 알 수 있습니다. 값을 통일하지 마세요.
 *    `prefers-reduced-motion` 에서는 애니메이션 없이 은은한 글로우만 남깁니다.
 */

export type VoicePhase =
  | "LISTENING"
  | "TRANSCRIBING"
  | "THINKING"
  | "ANSWERED"
  | "FOLLOW_UP";

/**
 * 마이크 뒤에 깔리는 **주황 물감 번짐 / 폭죽** 이펙트.
 *
 * blob 6개를 각각 다른 방향·지연으로 퍼뜨립니다. 단계별로 클래스만 갈아끼우고
 * 속도·확산 거리는 CSS 변수(`--burst-speed`, `--burst-spread`)로 조절합니다.
 */
export function VoiceBurst({ phase }: { phase: VoicePhase }) {
  return (
    <div
      className={`${styles.burst} ${styles[`burst${phase}`] ?? ""}`}
      aria-hidden
    >
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className={`${styles.blob} ${styles[`blob${i}`]}`} />
      ))}
    </div>
  );
}
