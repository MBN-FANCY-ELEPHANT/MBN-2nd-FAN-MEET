import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { api, type ContentSummary } from "../api/client";
import { STAR_ID } from "../app/constants";
import HeaderBack from "../components/layout/HeaderBack";
import Icon from "../components/ui/Icon";
import { ErrorState } from "../components/ui/States";
import { FEED_POSTS } from "../data/feed";
import type { FeedPost } from "../data/feed";
import { getSelectedArtist } from "../features/artist/selectedArtist";
import { currentLocale } from "../i18n";
import { formatCount, formatDuration, formatRelativeTime } from "../lib/format";
import { contentRoute } from "../lib/contentRoute";
import styles from "./FeedPage.module.css";

/**
 * 소식 탭 — 활동 기록 스레드 (Figma 19:912 / 19:1351).
 *
 * 한 타임라인에 **세 종류**가 섞입니다:
 *  - `POST`     실제 Content API의 아티스트 본인 글. 사진 + 본문 + 좋아요 + 댓글
 *  - `MANAGER`  팬매니저(비엔이) 공지. 연한 오렌지 말풍선, 댓글 없음
 *  - **무대 롱폼 영상** 실제 `Content(VIDEO)` 카드. 탭하면 영상 상세로
 *
 * 그리고 스레드 맨 위에 **AI 소식 요약**이 고정으로 붙습니다.
 * 카드를 열 개 읽지 않아도 "이번 주에 무슨 일이 있었는지"를 알 수 있어야 하기 때문입니다.
 *
 * 아티스트 글과 영상은 Content API, 팬매니저 공지만 정적 안내 데이터입니다.
 */

export default function FeedPage() {
  const { t } = useTranslation();
  const locale = currentLocale();

  // 아티스트 이름만 실제 데이터에서 가져옵니다 — 랜딩 선택이 없을 때의 폴백입니다.
  const { data: star } = useQuery({
    queryKey: ["star", STAR_ID],
    queryFn: () => api.getStar(STAR_ID),
    staleTime: 5 * 60 * 1000,
  });
  const artistName = getSelectedArtist() ?? star?.name ?? "";

  // 스레드에 끼워 넣을 무대 롱폼. 2건이면 글 사이사이에 자연스럽게 들어갑니다.
  const { data: videos } = useQuery({
    queryKey: ["contents", STAR_ID, "VIDEO", "feed"],
    queryFn: () => api.getContents({ starId: STAR_ID, type: "VIDEO", size: 2 }),
    staleTime: 5 * 60 * 1000,
  });
  const longforms = videos?.content ?? [];

  const { data: posts } = useQuery({
    queryKey: ["contents", STAR_ID, "POST", "feed"],
    queryFn: () => api.getContents({ starId: STAR_ID, type: "POST", size: 20 }),
    staleTime: 5 * 60 * 1000,
  });
  const artistPosts = posts?.content ?? [];

  return (
    <div className={styles.page}>
      <HeaderBack />
      <div className={styles.sheet}>
        <h2 className={styles.title}>{t("feed.title")}</h2>

        <NewsDigestCard locale={locale} />

        <div className={styles.list}>
          {artistPosts.map((post, index) => (
            <div key={post.id}>
              <ArtistPostCard post={post} artistName={artistName} />
              {/* 글 하나 걸러 하나씩 무대 영상을 끼웁니다 */}
              {longforms[index] && <LongformCard content={longforms[index]} />}
              {FEED_POSTS[index] && (
                <ManagerPostCard post={FEED_POSTS[index]} artistName={artistName} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * AI 소식 요약 — 스레드 맨 위 고정 카드.
 *
 * ⚠️ 작성 주체는 **AI 도우미 "비엔이"** 입니다. 스타 본인의 말투를 흉내내지 않습니다
 *    (기획서 5-2). 그래서 헤더에 AI 라벨과 생성 안내를 항상 붙입니다.
 *
 * 서버가 캐시를 채우기 전 첫 요청은 LLM 왕복이라 느립니다. 그동안은 스켈레톤을 띄우고,
 * 실패하면 카드 자체를 접습니다 — 소식 스레드는 이게 없어도 성립합니다.
 */
function NewsDigestCard({ locale }: { locale: string }) {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["newsDigest", STAR_ID, locale],
    queryFn: () => api.getNewsDigest(STAR_ID),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  if (isError) {
    return (
      <div className={styles.digest}>
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <section className={styles.digest}>
      <div className={styles.digestHead}>
        <span className={styles.digestBadge}>{t("feed.digestBadge")}</span>
        <h3 className={styles.digestTitle}>{t("feed.digestTitle")}</h3>
      </div>

      {isPending ? (
        <div className={styles.digestSkeleton} aria-hidden>
          <span />
          <span />
          <span />
        </div>
      ) : (
        <>
          <p className={styles.digestSummary}>{data.summary}</p>

          <dl className={styles.digestItems}>
            {data.items?.map((item) => (
              <div key={item.title} className={styles.digestItem}>
                <dt className={styles.digestItemTitle}>{item.title}</dt>
                <dd className={styles.digestItemBody}>{item.body}</dd>
              </div>
            ))}
          </dl>

          {data.sources && data.sources.length > 0 && (
            <div className={styles.digestSources}>
              <p className={styles.digestSourceLabel}>{t("feed.digestSources")}</p>
              <div className={styles.digestSourceList}>
                {data.sources.map((source) => (
                  <Link
                    key={source.contentId}
                    className={styles.digestSource}
                    to={contentRoute({ id: source.contentId, type: source.type })}
                  >
                    {source.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <p className={styles.digestNotice}>{t("feed.digestNotice")}</p>
    </section>
  );
}

/** 스레드에 섞이는 무대 롱폼 영상. 탭하면 영상 상세로 갑니다. */
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
            <span className={styles.authorTime}>{t("feed.longform")}</span>
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

      <div className={styles.actions}>
        <span className={styles.action}>
          <Icon name="heartFilled" size={24} />
          <span>{formatCount(content.likeCount ?? 0)}</span>
        </span>
        <span className={styles.action}>
          <Icon name="chatBubble" size={24} />
          <span>{formatCount(content.commentCount ?? 0)}</span>
        </span>
      </div>
    </article>
  );
}

function ArtistPostCard({
  post,
  artistName,
}: {
  post: ContentSummary;
  artistName: string;
}) {
  const { t } = useTranslation();
  const author = post.author.name || artistName;

  return (
    <article className={styles.post}>
      <div className={styles.postHead}>
        <div className={styles.author}>
          <img
            className={styles.avatar}
            src={post.author.profileImageUrl ?? post.thumbnailUrl}
            alt=""
          />
          <div className={styles.authorText}>
            <span className={styles.authorName}>{author}</span>
            <span className={styles.authorTime}>
              {formatRelativeTime(post.publishedAt)}
            </span>
          </div>
        </div>
      </div>

      <img className={styles.photo} src={post.thumbnailUrl} alt="" />
      <p className={styles.postBody}>{post.postBody ?? post.title}</p>

      <div className={styles.actions}>
        <span className={styles.action}>
          <Icon name="heartFilled" size={24} />
          <span>{formatCount(post.likeCount ?? 0)}</span>
        </span>
        <Link
          className={styles.action}
          to={`/posts/${post.id}/comments`}
          aria-label={t("comment.title")}
        >
          <Icon name="chatBubble" size={24} />
          <span>{formatCount(post.commentCount ?? 0)}</span>
        </Link>
      </div>
    </article>
  );
}

function ManagerPostCard({
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
        <p className={styles.postBody}>{post.body}</p>
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
