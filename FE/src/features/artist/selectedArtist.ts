/**
 * 랜딩페이지에서 고른 아티스트.
 *
 * 저장하는 값은 **이름 문자열**이고, 조회에 쓰는 `starId` 는 `ARTISTS` 에서 찾습니다
 * (`data.sql` 의 star 와 1:1). 이름을 저장하는 이유는 로고·인사말이 이름을 쓰기 때문입니다.
 */
import { ARTISTS } from "../../data/programs";


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

/**
 * 선택한 아티스트의 `starId`. 모든 조회가 이 값을 씁니다.
 *
 * 아직 아무도 고르지 않았거나 명단에 없는 이름이면 **첫 아티스트**로 떨어집니다 —
 * 랜딩을 건너뛰고 딥링크로 들어온 경우에도 화면이 비지 않게 하려는 것입니다.
 */
export function getSelectedStarId(): number {
  const name = getSelectedArtist();
  return ARTISTS.find((a) => a.name === name)?.starId ?? ARTISTS[0].starId;
}
