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
  /**
   * BE `star.id`. **`data.sql` 의 star 와 반드시 일치해야 합니다** —
   * 모든 조회(`?starId=`)가 이 값으로 나갑니다.
   */
  starId: number;
  /**
   * `FE/public/artists/<slug>/` 폴더 이름.
   * 랜딩·공연 포스터처럼 **BE 응답에 이미지 필드가 없는 화면**이 이 값으로 경로를 만듭니다.
   */
  slug: string;
  /**
   * 공연 포스터 파일명. **확장자가 아티스트마다 다를 수 있어** 따로 둡니다
   * (`schedule` 에 이미지 컬럼이 없어 BE 응답에서 가져올 수 없습니다).
   */
  concertImage: string;
  /**
   * `public/artists/<slug>/` 에 **실제로 넣어둔** 대표 사진들.
   *
   * 공연 카드처럼 BE 에 이미지가 없는 목록이 이 배열을 **돌려 씁니다** — 한 장만 쓰면
   * 목록 전체가 같은 그림으로 도배됩니다. 포스터로 가장 그럴듯한 것부터 넣으세요.
   *
   * ⚠️ 파일을 추가·삭제·개명하면 **이 배열도 같이 고쳐야** 합니다.
   *    `public/` 은 번들러가 훑지 않아 자동으로 알아낼 방법이 없습니다.
   */
  photos: string[];
  /** 출연 프로그램. 검색 결과에 보조 정보로 보여줍니다. 확인된 것만 채웁니다. */
  programs: string[];
};

/**
 * ⚠️ **BE 시드(`BE/src/main/resources/data.sql` 의 star)와 1:1 이어야 합니다.**
 *
 * 13명에서 3명으로 줄였습니다. 데이터가 없는 아티스트를 고르면 화면이 통째로 비어
 * 데모가 그 자리에서 끝나기 때문입니다. 이름은 `star.name` ·
 * `artist_stage.artist_name` · `EvidenceFinder.DOMAIN_WORDS` 와
 * **글자 하나까지 같아야** 음성 "OOO 무대 보여줘" 가 매칭됩니다.
 */
export const ARTISTS: Artist[] = [
  {
    name: "성리",
    starId: 1,
    slug: "sungri",
    concertImage: "concert.png",
    photos: ["concert.png", "post-1.png", "profile.png"],
    programs: [],
  },
  {
    name: "이찬원",
    starId: 2,
    slug: "chanwon",
    concertImage: "concert.png",
    photos: ["concert.png", "post-1.png", "profile.png"],
    programs: [],
  },
  {
    name: "박서진",
    starId: 3,
    slug: "seojin",
    concertImage: "concert.jpg",
    photos: ["concert.jpg", "post-1.jpg", "profile.png"],
    programs: ["한일톱텐쇼", "한일가왕전", "현역가왕2"],
  },
];

/** 이미지가 아직 없을 때 쓰는 폴백. `public/example_thumb.png` 는 항상 존재합니다. */
export const FALLBACK_IMAGE = "/example_thumb.png";

/**
 * 아티스트 이름 → `public/artists/<slug>/<file>` 경로.
 *
 * ⚠️ **BE 응답에 이미지 필드가 있는 화면에서는 쓰지 마세요.** 소식·기사·모집·성지는
 * 이미 응답의 URL 을 그대로 렌더하고 그 값이 `data.sql` 에 들어 있습니다.
 * 이 함수는 **BE 에 이미지 컬럼이 없는 두 곳**(랜딩 프로필·공연 포스터)만을 위한 것입니다.
 */
export function artistImage(name: string | null | undefined, file: string): string {
  const slug = ARTISTS.find((a) => a.name === name)?.slug;
  return slug ? `/artists/${slug}/${file}` : FALLBACK_IMAGE;
}

/** 공연 포스터. 파일명이 아티스트마다 달라 `ARTISTS` 에서 읽습니다. */
export function concertPosterImage(name: string | null | undefined): string {
  const artist = ARTISTS.find((a) => a.name === name);
  return artist ? `/artists/${artist.slug}/${artist.concertImage}` : FALLBACK_IMAGE;
}

/**
 * 아티스트 사진을 **번갈아** 고릅니다. `seed` 가 같으면 항상 같은 사진이 나옵니다.
 *
 * 공연은 BE 에 이미지 컬럼이 없어 한 장을 돌려 쓰는데, 그대로 두면 목록이 통째로
 * 같은 그림이 됩니다. `seed` 로 **일정 id** 를 넘기면 목록 카드와 상세 화면이
 * 같은 사진을 쓰게 되어 눌러 들어갔을 때 그림이 바뀌지 않습니다.
 *
 * 사진이 3장뿐이라 일정이 4건 이상이면 다시 돌아옵니다 — 같은 그림이 **연달아**
 * 나오지만 않으면 충분하다고 봤습니다.
 */
export function artistPhoto(
  name: string | null | undefined,
  seed: number,
): string {
  const artist = ARTISTS.find((a) => a.name === name);
  if (!artist || artist.photos.length === 0) return FALLBACK_IMAGE;
  // 음수 id 가 들어와도 배열 밖으로 나가지 않게 절댓값을 씁니다.
  const index = Math.abs(Math.trunc(seed)) % artist.photos.length;
  return `/artists/${artist.slug}/${artist.photos[index]}`;
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
