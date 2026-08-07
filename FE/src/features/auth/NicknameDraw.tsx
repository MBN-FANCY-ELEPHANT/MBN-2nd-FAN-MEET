import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { NICKNAME_POOL, drawNickname, setFanIdentity } from "./fanIdentity";
import styles from "./NicknameDraw.module.css";

/**
 * 닉네임 추첨 — 랜딩에서 아티스트를 고른 직후 뜨는 **로그인 대체** 연출.
 *
 * 배경을 블러 처리하고 화면 가운데에서 닉네임이 룰렛처럼 돌다가 하나로 멈춥니다.
 * 멈춘 값이 그대로 이 기기의 팬 신원이 됩니다 (`features/auth/fanIdentity.ts`).
 *
 * 연출 순서: 빠르게 회전 → 점점 느려짐 → 확정 → 확인 버튼
 *
 * ⚠️ 접근성: 회전 중 텍스트가 매 프레임 바뀌면 스크린리더가 계속 읽습니다.
 *    그래서 회전 구간은 `aria-hidden` 으로 감추고, 확정된 뒤에만 읽히게 합니다.
 */
export default function NicknameDraw({
  artist,
  onDone,
}: {
  artist: string;
  onDone: (nickname: string) => void;
}) {
  const { t } = useTranslation();
  const [spinning, setSpinning] = useState(true);
  const [display, setDisplay] = useState(NICKNAME_POOL[0]);
  const finalRef = useRef<string>("");

  useEffect(() => {
    finalRef.current = drawNickname();

    let cancelled = false;
    // 처음엔 60ms 로 빠르게 돌다가 점점 느려집니다 — 룰렛이 멎는 느낌.
    let delay = 60;
    let elapsed = 0;

    const tick = () => {
      if (cancelled) return;
      elapsed += delay;

      if (elapsed >= 2200) {
        setDisplay(finalRef.current);
        setSpinning(false);
        return;
      }

      setDisplay(
        NICKNAME_POOL[Math.floor(Math.random() * NICKNAME_POOL.length)],
      );
      // 뒤로 갈수록 간격을 늘려 감속시킵니다.
      delay = Math.min(delay * 1.18, 320);
      window.setTimeout(tick, delay);
    };

    const timer = window.setTimeout(tick, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  function confirm() {
    const nickname = finalRef.current;
    setFanIdentity({
      artist,
      nickname,
      issuedAt: new Date().toISOString(),
    });
    onDone(nickname);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.card}>
        <p className={styles.welcome}>{t("identity.welcome")}</p>

        <p className={styles.line}>
          <span className={styles.artist}>{artist}</span>
          <span className={styles.of}>{t("identity.of")}</span>
        </p>

        <p
          className={`${styles.nickname} ${spinning ? styles.spinning : ""}`}
          aria-hidden={spinning}
        >
          {display}
          <span className={styles.honorific}>{t("identity.honorific")}</span>
        </p>

        <button
          className={styles.confirm}
          onClick={confirm}
          disabled={spinning}
        >
          {spinning ? t("identity.drawing") : t("identity.confirm")}
        </button>
      </div>
    </div>
  );
}
