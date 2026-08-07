/**
 * 팬 신원 — **표시용 로컬 캐시**.
 *
 * 랜딩에서 아티스트를 고르면 `POST /api/v1/auth/guest`(`NicknameDraw.tsx`)가 실제
 * 게스트 계정과 Bearer 토큰을 발급하고, 서버가 중복 없이 배정한 닉네임을 여기 다시
 * 저장해 둡니다. 진짜 인증 상태(토큰)는 `api/client.ts`의 `setAccessToken`이
 * 관리하고, 여기는 화면에 "누구로 보이는가"만 즉시 그려주기 위한 캐시입니다.
 */

const STORAGE_KEY = "trot.fanIdentity";

export type FanIdentity = {
  /** 응원 아티스트 이름 */
  artist: string;
  /** 배정된 닉네임 (예: 부엉이) */
  nickname: string;
  /** 배정 시각 (ISO). 표시용은 아니고 디버깅·만료 판단용입니다. */
  issuedAt: string;
};

export function getFanIdentity(): FanIdentity | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FanIdentity) : null;
  } catch {
    // 시크릿 모드 등에서 접근이 막힐 수 있습니다 — 흐름은 그대로 이어집니다.
    return null;
  }
}

export function setFanIdentity(identity: FanIdentity | null): void {
  try {
    if (identity === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // 저장 실패해도 이번 세션 동안은 화면에 그대로 쓸 수 있습니다.
  }
}
