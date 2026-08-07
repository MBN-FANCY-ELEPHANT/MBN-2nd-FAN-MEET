import { useTranslation } from "react-i18next";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import Icon from "../components/ui/Icon";
import { FEED_POSTS } from "../data/feed";
import type { FeedPost } from "../data/feed";
import { getSelectedArtist } from "../features/artist/selectedArtist";
import { formatCount } from "../lib/format";
import styles from "./FeedPage.module.css";
import { useQuery } from "@tanstack/react-query";

/**
 * 소식 탭 — 활동 기록 피드 (Figma 19:912 / 19:1351).
 *
 * 아티스트 본인 글과 **팬매니저(비엔이) 공지**가 한 타임라인에 섞입니다.
 * 공지는 연한 오렌지 말풍선이고 댓글이 없습니다.
 *
 * ⚠️ 데이터는 `src/data/feed.ts` 의 **정적 더미**입니다. BE 에 `Post` 도메인이
 *    없습니다 (개편 3단계에서 계약 추가).
 */

export default function FeedPage() {
  const { t } = useTranslation();

  // 아티스트 이름만 실제 데이터에서 가져옵니다 — 랜딩 선택이 없을 때의 폴백입니다.
  const { data: star } = useQuery({
    queryKey: ["star", STAR_ID],
    queryFn: () => api.getStar(STAR_ID),
    staleTime: 5 * 60 * 1000,
  });
  const artistName = getSelectedArtist() ?? star?.name ?? "";

  return (
    <>
      <h2 className={styles.title}>{t("feed.title")}</h2>
      <div className={styles.list}>
        {FEED_POSTS.map((post) => (
          <PostCard key={post.id} post={post} artistName={artistName} />
        ))}
      </div>
    </>
  );
}

function PostCard({
  post,
  artistName,
}: {
  post: FeedPost;
  artistName: string;
}) {
  const { t } = useTranslation();
  const isManager = post.type === "MANAGER";
  const author = isManager ? t("feed.manager") : artistName;

  return (
    <article className={styles.post}>
      <div className={styles.postHead}>
        <div className={styles.author}>
          <img className={styles.avatar} src={post.avatarUrl} alt="" />
          <div className={styles.authorText}>
            <span className={styles.authorName}>{author}</span>
            <span className={styles.authorTime}>
              {t("feed.hoursAgo", { count: post.agoHours })}
            </span>
          </div>
        </div>
        {/* 공지 포스트에만 벨이 붙습니다 (Figma 19:953) */}
        {isManager && <Icon name="notificationBell" size={24} />}
      </div>

      {post.imageUrl && (
        <img className={styles.photo} src={post.imageUrl} alt="" />
      )}

      {isManager ? (
        <p className={styles.noticeBubble}>{post.body}</p>
      ) : (
        <p className={styles.body}>{post.body}</p>
      )}

      <div className={styles.actions}>
        <button className={styles.action} aria-label={t("content.like")}>
          <Icon name="heartFilled" size={24} />
          <span>{formatCount(post.likeCount)}</span>
        </button>
        {post.commentCount !== undefined && (
          <button className={styles.action} aria-label={t("comment.title")}>
            <Icon name="chatBubble" size={24} />
            <span>{formatCount(post.commentCount)}</span>
          </button>
        )}
      </div>
    </article>
  );
}
