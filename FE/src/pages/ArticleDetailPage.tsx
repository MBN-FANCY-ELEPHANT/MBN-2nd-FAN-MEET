import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { api } from "../api/client";
import AiPanel from "../components/ai/AiPanel";
import ArticleBody from "../components/article/ArticleBody";
import CommentPreview from "../components/content/CommentPreview";
import ContentCard from "../components/content/ContentCard";
import HeaderBack from "../components/layout/HeaderBack";
import PlaceCard from "../components/play/PlaceCard";
import Section from "../components/ui/Section";
import { ErrorState, LoadingState } from "../components/ui/States";
import { formatDate } from "../lib/format";
import styles from "./ContentDetail.module.css";

/**
 * 뉴스 상세 (Figma 6:267).
 *
 * 위에서 아래로: 제목 → 기자 → 대표 이미지 → **AI 분석** → 본문(용어 툴팁) →
 * 댓글 미리보기 → 관련 콘텐츠 → **기사에 나온 그 곳**.
 *
 * 마지막 섹션이 PLAY 탭의 성지순례와 같은 데이터를 다른 진입점에서 보여주는 구조입니다.
 */
export default function ArticleDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const contentId = Number(id);

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

      <div className={styles.body}>
        <h1 className={styles.articleTitle}>{data.title}</h1>

        <div className={styles.reporter}>
          {data.reporterAvatarUrl && (
            <img
              className={styles.reporterAvatar}
              src={data.reporterAvatarUrl}
              alt=""
            />
          )}
          <span className={styles.reporterName}>
            {data.reporterName ?? data.channelName}
          </span>
          <span className={styles.publishedAt}>
            {formatDate(data.publishedAt)}
          </span>
        </div>

        <img className={styles.hero} src={data.thumbnailUrl} alt="" />

        <AiPanel contentId={contentId} />

        {data.body && <ArticleBody body={data.body} />}

        <CommentPreview
          contentId={contentId}
          commentCount={data.commentCount ?? 0}
          to={`/articles/${contentId}/comments`}
        />
      </div>

      {related && related.length > 0 && (
        <div className={styles.body}>
          <Section title={t("content.relatedContents")}>
            <div className="scroll-x">
              {related.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </Section>
        </div>
      )}

      {data.places && data.places.length > 0 && (
        <div className={styles.body}>
          <Section title={t("content.placesInArticle")}>
            <div className="scroll-x">
              {data.places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
