import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ApiError, api } from "../api/client";
import AiPanel from "../components/ai/AiPanel";
import CommentPreview from "../components/content/CommentPreview";
import ContentCard from "../components/content/ContentCard";
import HeaderBack from "../components/layout/HeaderBack";
import Icon from "../components/ui/Icon";
import Section from "../components/ui/Section";
import { ErrorState, LoadingState } from "../components/ui/States";
import { useToast } from "../components/ui/useToast";
import { formatCount, formatRelativeTime } from "../lib/format";
import styles from "./ContentDetail.module.css";

/**
 * 영상 상세 (Figma 6:453 / 구독 중 상태 6:463).
 *
 * ⚠️ 영상은 **자체 호스팅하지 않습니다** (저작권). `mediaUrl` 은 YouTube 임베드 URL 이며
 * iframe 으로 재생합니다 (docs/mvp-scope.md 컷 목록).
 *
 * AI 분석 패널은 디자인에는 없지만 요청에 따라 기사 상세와 동일하게 넣었습니다.
 */
export default function VideoDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const contentId = Number(id);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["content", contentId],
    queryFn: () => api.getContent(contentId),
    enabled: Number.isFinite(contentId),
  });

  const { data: related } = useQuery({
    queryKey: ["content-related", contentId],
    queryFn: () => api.getRelatedContents(contentId, 6),
    enabled: Number.isFinite(contentId),
  });

  const onWriteError = (error: unknown) => {
    const code = error instanceof ApiError ? error.code : "UNKNOWN";
    toast(
      "error",
      t(code === "UNAUTHORIZED" ? "auth.loginRequired" : "toast.genericError"),
    );
  };

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["content", contentId] });

  const toggleLike = useMutation({
    mutationFn: () =>
      data?.liked ? api.unlikeContent(contentId) : api.likeContent(contentId),
    onSuccess: invalidate,
    onError: onWriteError,
  });

  const toggleSubscribe = useMutation({
    mutationFn: () =>
      data?.subscribed
        ? api.unsubscribeChannel(data.channel.id)
        : api.subscribeChannel(data!.channel.id),
    onSuccess: invalidate,
    onError: onWriteError,
  });

  const share = async () => {
    const url = window.location.href;
    try {
      // 모바일에서는 네이티브 공유 시트가 뜹니다. 데스크톱은 클립보드로 폴백합니다.
      if (navigator.share) await navigator.share({ title: data?.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("info", t("content.share"));
      }
    } catch {
      // 사용자가 공유 시트를 닫은 경우 — 에러가 아닙니다.
    }
  };

  if (isPending) {
    return (
      <div className={styles.page}>
        <HeaderBack />
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <HeaderBack />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <HeaderBack />

      <div className={styles.player}>
        {data.mediaUrl ? (
          <iframe
            src={data.mediaUrl}
            title={data.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img
            src={data.thumbnailUrl}
            alt=""
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>

      <div className={styles.body}>
        <h1 className={styles.videoTitle}>{data.title}</h1>
        <p className={styles.videoMeta}>
          {data.channelName} ·{" "}
          {t("content.views", { count: formatCount(data.viewCount) })} ·{" "}
          {formatRelativeTime(data.publishedAt)}
        </p>

        <div className={styles.actions}>
          <span className={styles.channel}>
            {data.channel.logoUrl && (
              <img
                className={styles.channelLogo}
                src={data.channel.logoUrl}
                alt=""
              />
            )}
          </span>
          <button
            className={`${styles.subscribe} ${data.subscribed ? styles.subscribed : ""}`}
            onClick={() => toggleSubscribe.mutate()}
            disabled={toggleSubscribe.isPending}
          >
            {data.subscribed ? t("content.subscribed") : t("content.subscribe")}
          </button>

          <button
            className={`${styles.iconButton} ${styles.spacer} ${data.liked ? styles.iconButtonActive : ""}`}
            onClick={() => toggleLike.mutate()}
            disabled={toggleLike.isPending}
            aria-pressed={data.liked}
            aria-label={t("content.like")}
          >
            <Icon name="heart" size={24} />
            {formatCount(data.likeCount)}
          </button>

          <button className={styles.iconButton} onClick={() => void share()}>
            <span aria-hidden>↗</span>
            {t("content.share")}
          </button>
        </div>

        <AiPanel contentId={contentId} />

        <CommentPreview
          contentId={contentId}
          commentCount={data.commentCount ?? 0}
          to={`/videos/${contentId}/comments`}
        />
      </div>

      {related && related.length > 0 && (
        <div className={styles.body}>
          <Section title={t("content.relatedVideos")}>
            <div className="scroll-x">
              {related.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
