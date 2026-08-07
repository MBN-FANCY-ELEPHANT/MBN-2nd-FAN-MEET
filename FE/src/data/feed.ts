import bienie from "../assets/mascot/bienie-banner.png";

/**
 * 소식 탭의 팬매니저 공지 — 정적 데이터.
 *
 * 아티스트 본인 글은 `Content(type=POST)` API로 이전했습니다. 팬매니저 공지는 댓글이 없는
 * 안내 성격이고 스타 사칭 방지 표시가 필요하므로 이 파일에만 남겨 둡니다.
 *
 * 포스트는 두 종류입니다 (Figma 19:924 / 19:945):
 *  - `ARTIST`  아티스트 본인 글. 사진 + 본문 + 좋아요 + 댓글
 *  - `MANAGER` **팬매니저(비엔이)** 공지. 연한 오렌지 말풍선 + 좋아요만, 댓글 없음
 *
 * ⚠️ `MANAGER` 는 AI 도우미가 **자기 이름으로** 공지하는 것이라 "스타 사칭 금지"
 *    정책(기획서 5-2)에 걸리지 않습니다. 이 구분을 없애지 마세요.
 */

export const FEED_POST_TYPES = ["ARTIST", "MANAGER"] as const;
export type FeedPostType = (typeof FEED_POST_TYPES)[number];

export type FeedPost = {
  id: number;
  type: FeedPostType;
  /** 표시용 작성자명. ARTIST 는 런타임에 선택된 아티스트 이름으로 덮어씁니다 */
  author: string;
  avatarUrl: string;
  /** i18n 상대시각으로 바꾸기 전까지 쓰는 표시 문자열 */
  agoHours: number;
  body: string;
  imageUrl?: string;
  likeCount: number;
  commentCount?: number;
};

export const MANAGER_AVATAR = bienie;

export const FEED_POSTS: FeedPost[] = [
  {
    id: 2,
    type: "MANAGER",
    author: "",
    avatarUrl: bienie,
    agoHours: 2,
    body: "8월 27일에 공연 일정이 새로 열립니다.",
    likeCount: 12300,
  },
];
