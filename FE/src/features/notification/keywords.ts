/**
 * 알림 관심 키워드 — **이 기기에만** 저장됩니다.
 *
 * 팬이 등록한 단어가 제목에 들어간 소식이 생기면 알려준다는 약속입니다
 * (드로어 문구: "키워드 설정하신 '진이'에 대한 영상이 등록되었습니다").
 *
 * ⚠️ BE 에 알림·키워드 도메인이 없습니다. 지금은 로컬 저장이고, 실제 푸시는 없습니다.
 *    계약이 생기면 이 모듈을 API 로 바꾸고 화면은 그대로 두면 됩니다.
 */

const STORAGE_KEY = "trot.notificationKeywords";

/** 한 사람이 관리할 수 있는 상한. 넘어가면 알림이 무의미해집니다. */
export const MAX_KEYWORDS = 10;

/** 처음 들어온 사람에게 보여줄 예시. 탭 한 번으로 등록됩니다. */
export const SUGGESTED_KEYWORDS = [
  "콘서트",
  "티켓팅",
  "신곡",
  "방송",
  "팬미팅",
  "굿즈",
];

export function listKeywords(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function write(keywords: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
  } catch {
    // 저장 실패해도 화면 흐름은 그대로 이어집니다.
  }
}

/**
 * 키워드를 추가하고 **갱신된 목록**을 돌려줍니다.
 * 공백만 있거나 이미 있는 단어, 상한을 넘긴 경우는 조용히 무시합니다.
 */
export function addKeyword(word: string): string[] {
  const next = word.trim();
  const current = listKeywords();
  if (!next || current.includes(next) || current.length >= MAX_KEYWORDS) {
    return current;
  }
  const updated = [...current, next];
  write(updated);
  return updated;
}

export function removeKeyword(word: string): string[] {
  const updated = listKeywords().filter((k) => k !== word);
  write(updated);
  return updated;
}
