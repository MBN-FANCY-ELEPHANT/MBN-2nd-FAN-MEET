import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { api, type ContentSummary } from "../../api/client";
import { STAR_ID } from "../../app/constants";
import { MASCOT } from "../../features/voice/mascot";
import { isUnauthorized } from "../../features/auth/useAuth";
import { formatCount, formatDuration, formatRelativeTime } from "../../lib/format";
import Icon from "../ui/Icon";
import { useToast } from "../ui/useToast";
import styles from "./FeedThread.module.css";

/**
 * 아티스트 소식 스레드 — **메인페이지와 소식 탭이 공유합니다** (Figma 27:6288).
 *
 * 한 타임라인에 **세 종류**가 최신순으로 섞입니다. 전부 `Content` API 실데이터입니다:
 *
 * | 종류 | 판별 | 렌더 |
 * |---|---|---|
 * | 아티스트 글 | `type=POST` · `author.type=STAR` | 아바타 + 사진 + 본문 |
 * | 팬매니저 공지 | `type=POST` · `author.type=MANAGER` | 마스코트 + 종 아이콘 + 연한 오렌지 말풍선 |
 * | 무대 롱폼 | `type=VIDEO` | 썸네일 + 재생 마크 + 재생시간 |
 *
 * 셋 다 **좋아요와 댓글**이 붙고, 좋아요는 실제로 서버에 반영됩니다.
 *
 * ⚠️ **팬매니저 공지의 작성 주체는 AI 도우미 "비엔이" 이며 스타 본인이 아닙니다**
 *    (기획서 5-2). 그래서 아바타·이름을 아티스트와 **다르게** 그립니다. 이 구분을 없애면
 *    공지가 아티스트가 쓴 글처럼 보입니다.
 *
 * ⚠️ 좋아요 상태(`liked`)는 목록 응답에 없습니다 — 상세(`GET /contents/{id}`)에만 있습니다.
 *    그래서 여기서는 **누른 뒤 목록을 다시 받아** 카운트만 갱신합니다. 하트 채움 상태를
 *    카드마다 정확히 표시하려면 목록 응답에 `liked` 를 추가해야 합니다 (계약 변경).
 */
export default function FeedThread() {
  const { t } = useTranslation();

  const { data: posts } = useQuery({
    queryKey: ["contents", STAR_ID, "POST", "feed"],
    queryFn: () => api.getContents({ starId: STAR_ID, type: "POST", size: 20 }),
  });

  const { data: videos } = useQuery({
    queryKey: ["contents", STAR_ID, "VIDEO", "feed"],
    queryFn: () => api.getContents({ starId: STAR_ID, type: "VIDEO", size: 5 }),
  });

  // 세 종류를 한 줄로 합쳐 최신순 정렬합니다 — 종류별로 묶어 보여주면 "스레드"가 아니라
  // 목록 세 개가 됩니다.
  const items = [...(posts?.content ?? []), ...(videos?.content ?? [])].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  if (items.length === 0) return null;

  return (
    <div className={styles.list}>
      {items.map((item) =>
        item.type === "VIDEO" ? (
          <LongformCard key={`v-${item.id}`} content={item} />
        ) : item.author.type === "MANAGER" ? (
          <ManagerNoticeCard key={`m-${item.id}`} content={item} />
        ) : (
          <ArtistPostCard key={`p-${item.id}`} content={item} />
        ),
      )}
      <p className={styles.threadNotice}>{t("feed.managerNotice")}</p>
    </div>
  );
}

/* ── 좋아요 · 댓글 ─────────────────────────────────────────────────── */

/**
 * 좋아요 + 댓글 줄. 세 카드가 공유합니다.
 *
 * ⚠️ **하트 채움(`liked`)이 눌렀다는 유일한 신호입니다.** `likeCount` 는 화면에서 만 단위로
 *    반올림돼(12,300 → "1.2만") 1 증가가 보이지 않습니다. 그래서 목록 응답에 `liked` 를
 *    넣었고(계약 변경), 여기서 채운 하트 ↔ 빈 하트를 토글합니다.
 *
 * 낙관적 갱신은 하지 않습니다 — 서버 응답 뒤 목록을 다시 받습니다. 실패하면 카운트가
 * 잘못 남는 것보다 잠깐 늦는 편이 낫습니다.
 */
function FeedActions({
  content,
  commentPath,
}: {
  content: ContentSummary;
  commentPath: string;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: () =>
      content.liked ? api.unlikeContent(content.id) : api.likeContent(content.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
    onError: (error) => {
      toast(
        "error",
        isUnauthorized(error) ? t("auth.loginRequired") : t("toast.genericError"),
      );
    },
  });

  return (
    <div className={styles.actions}>
      <button
        className={`${styles.action} ${content.liked ? styles.actionOn : ""}`}
        onClick={() => toggleLike.mutate()}
        disabled={toggleLike.isPending}
        aria-pressed={content.liked}
        aria-label={t("content.like")}
      >
        <Icon name={content.liked ? "heartFilled" : "heartOutline"} size={24} />
        <span>{formatCount(content.likeCount ?? 0)}</span>
      </button>
      <Link
        className={styles.action}
        to={commentPath}
        aria-label={t("comment.title")}
      >
        <Icon name="chatBubble" size={24} />
        <span>{formatCount(content.commentCount ?? 0)}</span>
      </Link>
    </div>
  );
}

/* ── 카드 3종 ──────────────────────────────────────────────────────── */

/** 아티스트가 직접 올린 이야기 — 사진 + 본문. */
function ArtistPostCard({ content }: { content: ContentSummary }) {
  return (
    <article className={styles.post}>
      <div className={styles.postHead}>
        <div className={styles.author}>
          <img
            className={styles.avatar}
            src={content.author.profileImageUrl ?? content.thumbnailUrl}
            alt=""
          />
          <div className={styles.authorText}>
            <span className={styles.authorName}>{content.author.name}</span>
            <span className={styles.authorTime}>
              {formatRelativeTime(content.publishedAt)}
            </span>
          </div>
        </div>
      </div>

      <img className={styles.photo} src={content.thumbnailUrl} alt="" />
      <p className={styles.body}>{content.postBody ?? content.title}</p>

      <FeedActions content={content} commentPath={`/posts/${content.id}/comments`} />
    </article>
  );
}

/**
 * 팬매니저 공지 — 연한 오렌지 말풍선 + 종 아이콘.
 *
 * ⚠️ 아바타는 응답의 `profileImageUrl` 이 아니라 **번들된 마스코트**를 씁니다.
 *    공지 주체가 AI 도우미라는 것이 아바타에서 바로 읽혀야 하고, 시드의 경로가 바뀌어도
 *    이 구분이 깨지면 안 됩니다.
 */
function ManagerNoticeCard({ content }: { content: ContentSummary }) {
  const { t } = useTranslation();

  return (
    <article className={styles.post}>
      <div className={styles.postHead}>
        <div className={styles.author}>
          {MASCOT.banner ? (
            <img className={styles.avatar} src={MASCOT.banner} alt="" />
          ) : (
            <span className={styles.avatarFallback} aria-hidden />
          )}
          <div className={styles.authorText}>
            <span className={styles.authorName}>{t("feed.manager")}</span>
            <span className={styles.authorTime}>
              {formatRelativeTime(content.publishedAt)}
            </span>
          </div>
        </div>
        {/* 공지에만 벨이 붙습니다 (Figma 27:6288) */}
        <Icon name="notificationBell" size={24} />
      </div>

      <p className={styles.noticeBubble}>{content.postBody ?? content.title}</p>

      <FeedActions content={content} commentPath={`/posts/${content.id}/comments`} />
    </article>
  );
}

/** 무대 롱폼 영상 — 탭하면 영상 상세로. */
function LongformCard({ content }: { content: ContentSummary }) {
  const { t } = useTranslation();

  return (
    <article className={styles.post}>
      <div className={styles.postHead}>
        <div className={styles.author}>
          <span className={styles.longformMark} aria-hidden>
            <Icon name="youtube" size={20} />
          </span>
          <div className={styles.authorText}>
            <span className={styles.authorName}>{content.channelName}</span>
            <span className={styles.authorTime}>
              {formatRelativeTime(content.publishedAt)} · {t("feed.longform")}
            </span>
          </div>
        </div>
      </div>

      <Link className={styles.longformLink} to={`/videos/${content.id}`}>
        <span className={styles.longformThumb}>
          <img src={content.thumbnailUrl} alt="" loading="lazy" />
          <span className={styles.longformPlay} aria-hidden>
            <Icon name="youtube" size={24} />
          </span>
          {content.durationSec != null && (
            <span className={styles.longformDuration}>
              {formatDuration(content.durationSec)}
            </span>
          )}
        </span>
        <span className={styles.longformTitle}>{content.title}</span>
      </Link>

      <FeedActions
        content={content}
        commentPath={`/videos/${content.id}/comments`}
      />
    </article>
  );
}
