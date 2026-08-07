import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { ApiError, api } from "../../api/client";
import { setFanIdentity } from "./fanIdentity";
import styles from "./NicknameDraw.module.css";

/** 409(경합)로 예약이 실패했을 때 조용히 재시도할 최대 횟수 */
const MAX_RESERVE_RETRIES = 2;

/**
 * 닉네임 추첨 — 랜딩에서 아티스트를 고른 직후 뜨는 **로그인 대체** 연출.
 *
 * 배경을 블러 처리하고 화면 가운데에서 닉네임이 룰렛처럼 돌다가 하나로 멈춥니다.
 * 멈춘 값이 그대로 이 기기의 팬 신원이 됩니다 (`features/auth/fanIdentity.ts`).
 * 닉네임 후보와 확정은 서버가 관리합니다 (`GET/POST /api/v1/nicknames/*`) —
 * 플랫폼 전체에서 유일해야 하는 값이라 로컬 배열로 뽑을 수 없습니다.
 *
 * 연출 순서: (서버 후보 로딩) → 빠르게 회전 → 점점 느려짐 → 확정 → 확인 버튼 → 예약
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

  const {
    data,
    isPending: isListPending,
    isError: isListError,
    refetch,
  } = useQuery({
    queryKey: ["nicknames", "available", 20],
    queryFn: () => api.nicknames.available(20),
  });

  const [spinning, setSpinning] = useState(true);
  const [display, setDisplay] = useState("");
  const [reserveFailed, setReserveFailed] = useState(false);
  const finalRef = useRef<string>("");
  const retryCountRef = useRef(0);

  // 서버 후보 목록이 (처음 또는 재추첨으로) 갱신될 때마다 룰렛을 돌립니다.
  // 목록이 아직 안 왔거나 소진됐으면 아무것도 하지 않고 대기합니다 —
  // 그 대기 구간 자체가 "회전 시작을 살짝 늦추는" 자연스러운 로딩 연출입니다.
  useEffect(() => {
    const pool = data?.nicknames;
    if (!pool || pool.length === 0) return;

    finalRef.current = pool[Math.floor(Math.random() * pool.length)];

    let cancelled = false;
    // 처음엔 60ms 로 빠르게 돌다가 점점 느려집니다 — 룰렛이 멎는 느낌.
    let delay = 60;
    let elapsed = 0;

    setSpinning(true);

    const tick = () => {
      if (cancelled) return;
      elapsed += delay;

      if (elapsed >= 2200) {
        setDisplay(finalRef.current);
        setSpinning(false);
        return;
      }

      setDisplay(pool[Math.floor(Math.random() * pool.length)]);
      // 뒤로 갈수록 간격을 늘려 감속시킵니다.
      delay = Math.min(delay * 1.18, 320);
      window.setTimeout(tick, delay);
    };

    const timer = window.setTimeout(tick, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [data]);

  const reserve = useMutation({
    mutationFn: (nickname: string) => api.nicknames.reserve(nickname),
    onSuccess: (res) => {
      setFanIdentity({
        artist,
        nickname: res.nickname,
        issuedAt: res.reservedAt,
      });
      onDone(res.nickname);
    },
    onError: (error) => {
      const isConflict = error instanceof ApiError && error.status === 409;

      if (isConflict && retryCountRef.current < MAX_RESERVE_RETRIES) {
        // 다른 사용자가 먼저 같은 닉네임을 예약한, 드문 경합 상황입니다.
        // 티 내지 않고 목록을 다시 받아 룰렛을 처음부터 다시 돌립니다.
        retryCountRef.current += 1;
        setSpinning(true);
        void refetch();
        return;
      }

      setReserveFailed(true);
    },
  });

  const pool = data?.nicknames ?? [];
  const poolExhausted = !isListPending && !isListError && pool.length === 0;
  const showError = reserveFailed || poolExhausted || isListError;

  function confirm() {
    if (spinning || reserve.isPending || !finalRef.current) return;
    reserve.mutate(finalRef.current);
  }

  function retry() {
    retryCountRef.current = 0;
    setReserveFailed(false);
    void refetch();
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.card}>
        <p className={styles.welcome}>{t("identity.welcome")}</p>

        <p className={styles.line}>
          <span className={styles.artist}>{artist}</span>
          <span className={styles.of}>{t("identity.of")}</span>
        </p>

        {showError ? (
          <>
            <p className={styles.error}>
              {poolExhausted
                ? t("identity.poolExhausted")
                : t("identity.error")}
            </p>
            <button className={styles.confirm} onClick={retry}>
              {t("identity.retry")}
            </button>
          </>
        ) : (
          <>
            <p
              className={`${styles.nickname} ${spinning ? styles.spinning : ""}`}
              aria-hidden={spinning}
            >
              {display}
              {display && (
                <span className={styles.honorific}>
                  {t("identity.honorific")}
                </span>
              )}
            </p>

            <button
              className={styles.confirm}
              onClick={confirm}
              disabled={spinning || reserve.isPending}
            >
              {reserve.isPending
                ? t("identity.reserving")
                : spinning
                  ? t("identity.drawing")
                  : t("identity.confirm")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
