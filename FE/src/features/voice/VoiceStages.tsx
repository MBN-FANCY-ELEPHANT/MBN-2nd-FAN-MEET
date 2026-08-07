import { useTranslation } from "react-i18next";

import styles from "./VoiceStages.module.css";

/**
 * 음성 도우미의 **5단계 진행 표시**와 주황 이펙트.
 *
 * <b>왜 단계를 눈에 보이게 하나</b>
 * 주 사용자층이 중장년입니다. 말을 걸고 나면 "지금 뭘 하고 있는지"가 보이지 않으면
 * 답이 오기 전에 다시 마이크를 누르거나 시트를 닫아버립니다.
 * 그래서 듣기 → 받아쓰기 → 분석 → 답변 → 다음 지시 를 항상 띄워 둡니다.
 *
 * ⚠️ 이펙트는 **장식이 아니라 상태 신호**입니다. 단계마다 속도와 개수가 달라서
 *    화면을 안 읽어도 "지금 도는 중"인지 "끝났는지"를 알 수 있어야 합니다.
 *    `prefers-reduced-motion` 에서는 애니메이션 없이 은은한 글로우만 남깁니다.
 */

export type VoicePhase =
  | "LISTENING"
  | "TRANSCRIBING"
  | "THINKING"
  | "ANSWERED"
  | "FOLLOW_UP";

const STEPS: { phase: VoicePhase; labelKey: string }[] = [
  { phase: "LISTENING", labelKey: "voice.step.listen" },
  { phase: "TRANSCRIBING", labelKey: "voice.step.write" },
  { phase: "THINKING", labelKey: "voice.step.analyze" },
  { phase: "ANSWERED", labelKey: "voice.step.answer" },
  { phase: "FOLLOW_UP", labelKey: "voice.step.next" },
];

function stepIndex(phase: VoicePhase): number {
  return STEPS.findIndex((s) => s.phase === phase);
}

/** 상단 진행 레일 — 5개 점과 현재 단계 이름. */
export function VoiceStageRail({ phase }: { phase: VoicePhase }) {
  const { t } = useTranslation();
  const current = stepIndex(phase);

  return (
    <div
      className={styles.rail}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
      aria-valuenow={current + 1}
      aria-valuetext={t("voice.stepStatus", {
        step: current + 1,
        label: t(STEPS[current].labelKey),
      })}
    >
      <ol className={styles.dots}>
        {STEPS.map((step, i) => (
          <li
            key={step.phase}
            className={[
              styles.dot,
              i < current ? styles.dotDone : "",
              i === current ? styles.dotCurrent : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles.dotMark} aria-hidden />
          </li>
        ))}
      </ol>
      <p className={styles.stepLabel}>
        {t("voice.stepStatus", {
          step: current + 1,
          label: t(STEPS[current].labelKey),
        })}
      </p>
    </div>
  );
}

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
