import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { api } from "../../api/client";
import { formatCount } from "../../lib/format";
import styles from "../../pages/ContentDetail.module.css";

/**
 * 상세 화면 하단의 댓글 미리보기 (Figma 6:267 / 6:453).
 *
 * 댓글 수와 대표 댓글 1건만 보여주고, 탭하면 댓글 화면으로 이동합니다.
 * 상세 화면에서 댓글 전체를 로드하면 스크롤이 무거워집니다.
 */
export default function CommentPreview({
  contentId,
  commentCount,
  to,
}: {
  contentId: number;
  commentCount: number;
  to: string;
}) {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ["comments", contentId],
    queryFn: () => api.getComments(contentId, { size: 1 }),
  });

  const top = data?.content?.[0];

  return (
    <Link to={to} className={styles.commentPreview}>
      <span className={styles.commentCount}>
        {t("comment.count", { count: formatCount(commentCount) })}
      </span>
      {top && (
        <div className={styles.commentRow}>
          <img
            className={styles.commentAvatar}
            src={top.author.profileImageUrl}
            alt=""
          />
          <span className={styles.commentBody}>{top.body}</span>
        </div>
      )}
    </Link>
  );
}
