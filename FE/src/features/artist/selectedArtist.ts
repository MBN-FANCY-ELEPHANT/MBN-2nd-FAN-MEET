/**
 * 랜딩페이지에서 고른 아티스트 — **임시 연결 표시용**입니다.
 *
 * ⚠️ 지금은 이름 문자열만 들고 있습니다. 실제 팬덤 공간은 아직 `STAR_ID = 1` 하나뿐이라
 *    선택한 아티스트가 어느 스타 데이터에 매핑되는지가 정해져 있지 않습니다
 *    (다중 스타는 `docs/mvp-scope.md` 컷 목록에 있습니다).
 *
 *    기능 개편 방향이 확정되면(2단계) `Star` 엔티티에 프로그램·출연자를 연결하고
 *    이 모듈을 `starId` 기반으로 승격하세요. 그때까지는 메인 화면 상단에
 *    "선택됨" 배지만 띄워 흐름이 이어진다는 것을 보여줍니다.
 */

const STORAGE_KEY = "trot.selectedArtist";

/** 저장된 선택을 읽습니다. 없으면 null. */
export function getSelectedArtist(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // 시크릿 모드 등에서 localStorage 접근이 막힐 수 있습니다 — 조용히 무시합니다.
    return null;
  }
}

/** 선택을 저장합니다. null 이면 지웁니다. */
export function setSelectedArtist(name: string | null): void {
  try {
    if (name === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, name);
    }
  } catch {
    // 저장 실패해도 화면 흐름은 그대로 이어집니다.
  }
}

/**
 * 로고·인사말에 쓰는 짧은 호칭. 디자인이 `박서진` → **`매일서진`**, `오늘도 서진이와`
 * 처럼 **성을 뗀 이름**을 씁니다 (Figma 19:913 / 19:915).
 *
 * 한국어 3글자 이름만 성을 떼고, 그 외(2글자·외국어·그룹명)는 그대로 둡니다 —
 * `린`, `마리아 리스`, `후쿠다 미라이` 를 임의로 자르면 오히려 이상해집니다.
 */
export function shortArtistName(name: string): string {
  const chars = Array.from(name);
  const isKoreanThreeLetter =
    chars.length === 3 && chars.every((c) => /[가-힣]/.test(c));
  return isKoreanThreeLetter ? chars.slice(1).join("") : name;
}

/**
 * 한국어 인사말용 — 받침이 있으면 `이` 를 붙입니다 (`서진` → `서진이`, `수호` → `수호`).
 *
 * 디자인 문구가 "오늘도 **서진이**와 즐거운 하루 보내세요!" 인데, 받침을 따지지 않으면
 * `나츠코이와` 처럼 어색해집니다. 한국어 로케일에서만 씁니다.
 */
export function withKoreanNameParticle(name: string): string {
  const last = Array.from(name).at(-1);
  if (!last || !/[가-힣]/.test(last)) return name;
  // 한글 음절 = 0xAC00 + (초성*21 + 중성)*28 + 종성. 종성이 0 이면 받침 없음.
  const hasFinalConsonant = (last.charCodeAt(0) - 0xac00) % 28 !== 0;
  return hasFinalConsonant ? `${name}이` : name;
}
