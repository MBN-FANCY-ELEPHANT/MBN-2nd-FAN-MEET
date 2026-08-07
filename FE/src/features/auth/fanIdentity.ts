/**
 * 팬 신원 — **로그인 대체**.
 *
 * 랜딩에서 아티스트를 고르면 서버가 관리하는 유일한 닉네임을 예약해 그것으로
 * 신원을 삼습니다 (`NicknameDraw.tsx`, `GET/POST /api/v1/nicknames/*`).
 * 회원가입·비밀번호가 없고 `localStorage` 에만 남으므로 **같은 기기에서만** 유지됩니다.
 *
 * ⚠️ 서버 인증이 아닙니다. BE 의 간이 인증(HMAC 토큰)과는 별개이고, 쓰기 API 는
 *    여전히 데모 계정 로그인이 필요합니다. 이건 "누구로 보이는가"만 담당합니다.
 *    (개편 3단계에서 이 닉네임으로 실제 계정을 만들지 결정하세요.)
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
