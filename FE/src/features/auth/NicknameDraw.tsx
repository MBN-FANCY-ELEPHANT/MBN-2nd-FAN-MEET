import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { STAR_ID } from "../../app/constants";
import { api, setAccessToken } from "../../api/client";
import { currentLocale } from "../../i18n";
import { setFanIdentity } from "./fanIdentity";
import styles from "./NicknameDraw.module.css";

/** 회전 연출에만 쓰는 장식용 후보 — 실제 배정값과 무관합니다. */
const SPIN_DISPLAY_POOL = [
  "부엉이",
  "코끼리",
  "다람쥐",
  "고슴도치",
  "햄스터",
  "펭귄",
  "곰돌이",
  "토끼",
  "수달",
  "여우",
  "고양이",
  "강아지",
  "병아리",
  "너구리",
  "판다",
  "알파카",
];

/** 최소 이만큼은 돌립니다 — 서버 응답이 즉시 와도 룰렛처럼 보이도록. */
const MIN_SPIN_MS = 2200;

/**
 * 닉네임 추첨 — 랜딩에서 아티스트를 고른 직후 뜨는 **로그인 대체** 연출.
 *
 * 배경을 블러 처리하고 화면 가운데에서 닉네임이 룰렛처럼 돌다가 하나로 멈춥니다.
 * 회전 중 보여주는 값은 장식용이고, 실제 닉네임은 `POST /api/v1/auth/guest`가
 * 서버에서 중복 없이 배정합니다 (`kr.co.mbn.trot.auth.service.AuthService`).
 * 이 호출로 실제 게스트 계정과 Bearer 토큰도 함께 발급되므로, 확정 즉시
 * 좋아요·댓글·모임 신청 같은 쓰기 API를 바로 쓸 수 있습니다.
 *
 * 연출 순서: 회전 시작 + 백그라운드로 계정 발급 요청 → 최소 회전 시간 경과 &&
 * 응답 도착 → 확정 → 확인 버튼
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
  const queryClient = useQueryClient();

  const [spinning, setSpinning] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [display, setDisplay] = useState(SPIN_DISPLAY_POOL[0]);
  const startedRef = useRef(false);

  /**
   * 발급된 닉네임 — **뮤테이션 상태가 아니라 여기서 읽습니다.**
   *
   * ⚠️ `registerGuest.isSuccess` 를 쓰면 **StrictMode 개발 모드에서 영원히 `pending`** 입니다.
   *    `useEffect` 안에서 `mutate()` 를 부르는데, StrictMode 가 효과를 두 번 돌리는 사이
   *    뮤테이션 옵저버가 결과 통지를 놓칩니다. 요청 자체는 201 로 정상 완료되고
   *    `onSuccess` 도 실행돼서 **토큰·닉네임은 저장되는데 화면만 "추첨 중..." 에 멈춥니다.**
   *    (실제로 겪음 — 랜딩에서 앱에 아예 못 들어갔습니다.)
   */
  const [issued, setIssued] = useState<{ nickname: string } | null>(null);
  const [failed, setFailed] = useState(false);

  const registerGuest = useMutation({
    mutationFn: () =>
      api.registerGuest({
        starId: STAR_ID,
        artistName: artist,
        locale: currentLocale().toUpperCase(),
      }),
    onSuccess: (res) => {
      setAccessToken(res.accessToken);
      setFanIdentity({
        artist,
        nickname: res.user.nickname,
        issuedAt: new Date().toISOString(),
      });
      setIssued({ nickname: res.user.nickname });
      setFailed(false);
      // 좋아요·구독·신청 상태 등이 이제 이 계정 기준으로 바뀌므로 다시 받아옵니다.
      void queryClient.invalidateQueries();
    },
    onError: () => setFailed(true),
  });

  // StrictMode 이중 호출로 게스트 계정이 두 번 생성되지 않도록 막습니다.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    registerGuest.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 장식용 회전 애니메이션 — 실제 배정과 무관하게 최소 시간 동안 돕니다.
  useEffect(() => {
    let cancelled = false;
    let delay = 60;
    let elapsed = 0;

    const tick = () => {
      if (cancelled) return;
      elapsed += delay;

      if (elapsed >= MIN_SPIN_MS) {
        setMinTimeElapsed(true);
        return;
      }

      setDisplay(
        SPIN_DISPLAY_POOL[Math.floor(Math.random() * SPIN_DISPLAY_POOL.length)],
      );
      delay = Math.min(delay * 1.18, 320);
      window.setTimeout(tick, delay);
    };

    const timer = window.setTimeout(tick, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const ready = minTimeElapsed && issued !== null;

  useEffect(() => {
    if (ready && issued) {
      setDisplay(issued.nickname);
      setSpinning(false);
    }
  }, [ready, issued]);

  function confirm() {
    if (!ready || !issued) return;
    onDone(issued.nickname);
  }

  function retry() {
    startedRef.current = true;
    setFailed(false);
    registerGuest.mutate();
  }

  const showError = failed;

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
            <p className={styles.error}>{t("identity.error")}</p>
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
              <span className={styles.honorific}>{t("identity.honorific")}</span>
            </p>

            <button
              className={styles.confirm}
              onClick={confirm}
              disabled={!ready}
            >
              {spinning ? t("identity.drawing") : t("identity.confirm")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
