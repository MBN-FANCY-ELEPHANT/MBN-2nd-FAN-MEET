import exampleAvatar from "../assets/example/example_avatar.png";
import exampleFeed from "../assets/example/example_feed.png";
import bienie from "../assets/mascot/bienie-banner.png";

/**
 * 소식 탭 "활동 기록" 피드 — **임시 정적 데이터**.
 *
 * ⚠️ BE 에 `Post`/`Feed` 도메인이 없습니다. 커뮤니티 게시판은 `docs/mvp-scope.md`
 *    컷 목록에 있었는데, 디자인 2차본(Figma 19:912)에서 아티스트 활동 기록 피드가
 *    새로 들어왔습니다. 기능 방향이 확정되면(2단계) `api-spec.yaml` 에 엔드포인트를
 *    추가하고 이 파일을 걷어내세요.
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

export const ARTIST_AVATAR = exampleAvatar;
export const MANAGER_AVATAR = bienie;

export const FEED_POSTS: FeedPost[] = [
  {
    id: 1,
    type: "ARTIST",
    author: "",
    avatarUrl: exampleAvatar,
    agoHours: 2,
    body: "오늘 훠궈 먹었어요 ^^",
    imageUrl: exampleFeed,
    likeCount: 12300,
    commentCount: 4897,
  },
  {
    id: 2,
    type: "MANAGER",
    author: "",
    avatarUrl: bienie,
    agoHours: 2,
    body: "8월 27일에 공연 일정이 새로 열립니다.",
    likeCount: 12300,
  },
  {
    id: 3,
    type: "ARTIST",
    author: "",
    avatarUrl: exampleAvatar,
    agoHours: 5,
    body: "무대 준비 중입니다. 곧 만나요!",
    imageUrl: exampleFeed,
    likeCount: 9800,
    commentCount: 2130,
  },
];
