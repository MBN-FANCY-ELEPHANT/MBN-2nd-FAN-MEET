/**
 * 응원 아티스트 명단 — 랜딩페이지 데이터.
 *
 * ⚠️ **임시 정적 데이터입니다.** BE 계약이 아직 없습니다 (개편 3단계에서 추가).
 *
 * ⚠️ 이전에는 MBN 프로그램 9개의 전 출연자 274명을 담고 있었는데, **선택 폭이 너무 넓어**
 *    13명으로 줄였습니다. 랜딩이 프로그램별로 묶지 않고 평면 그리드로 뿌리게 되면서
 *    프로그램 구조 자체도 걷어내고 **아티스트 목록**으로 단순화했습니다.
 *    출연 프로그램은 검색 결과의 보조 정보로만 남깁니다 (확인된 것만).
 *
 * ⚠️ 아티스트명은 고유명사라 i18n 대상이 아닙니다 (기존 코드가 "MBN" 을 리터럴로 두는 것과 동일).
 */

export type Artist = {
  name: string;
  /** 출연 프로그램. 검색 결과에 보조 정보로 보여줍니다. 확인된 것만 채웁니다. */
  programs: string[];
};

export const ARTISTS: Artist[] = [
  { name: "임영웅", programs: [] },
  { name: "이찬원", programs: [] },
  { name: "박군", programs: [] },
  { name: "영탁", programs: [] },
  { name: "성리", programs: [] },
  { name: "박서진", programs: ["한일톱텐쇼", "한일가왕전", "현역가왕2"] },
  { name: "김용빈", programs: [] },
  { name: "린", programs: ["한일톱텐쇼", "한일가왕전", "인생앨범-예스터데이"] },
  { name: "장민호", programs: ["우리들의 트로트"] },
  { name: "김다현", programs: ["한일톱텐쇼", "한일가왕전", "보이스트롯"] },
  { name: "김태연", programs: ["한일가왕전", "보이스트롯"] },
  { name: "홍진영", programs: ["불타는 트롯맨"] },
  { name: "허찬미", programs: ["우리들의 트로트"] },
];

/** 현재 팬공간이 준비된 아티스트. DB 목록으로 교체한 뒤에도 이름 기준으로 제한합니다. */
const SELECTABLE_ARTIST_NAMES = new Set(["박서진", "이찬원", "성리"]);

export function isSelectableArtist(name: string): boolean {
  return SELECTABLE_ARTIST_NAMES.has(name.trim().normalize("NFC"));
}

/**
 * 가나다순 아티스트 이름 목록.
 *
 * `Intl.Collator("ko")` 를 쓰는 이유: 한글은 코드포인트 순서와 사전 순서가 대체로 맞지만,
 * 라틴 문자가 섞였을 때의 배치까지 로케일 규칙으로 일관되게 처리하려면 collator 가 필요합니다.
 */
export function allArtists(): string[] {
  return ARTISTS.map((a) => a.name).sort(new Intl.Collator("ko").compare);
}

export type ArtistHit = {
  name: string;
  /** 출연 프로그램. 없으면 빈 배열입니다. */
  programs: string[];
};

/** 이름 부분일치 검색. */
export function searchArtists(query: string): ArtistHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ARTISTS.filter((a) => a.name.toLowerCase().includes(q)).map((a) => ({
    name: a.name,
    programs: a.programs,
  }));
}

/** AI 프롬프트에 넣을 전체 명단 — 서비스가 다루는 아티스트 범위입니다. */
export function artistRoster(): string[] {
  return ARTISTS.map((a) => a.name);
}
