import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { api } from "../api/client";
import HeaderBack from "../components/layout/HeaderBack";
import Icon from "../components/ui/Icon";
import { ErrorState, LoadingState } from "../components/ui/States";
import { formatCount } from "../lib/format";
import styles from "./ShortformPage.module.css";

/**
 * 숏폼 세로 플레이어 (Figma 19:3365).
 *
 * 화면 전체가 영상이고, 우측 레일(좋아요·댓글·공유)과 하단 정보(채널·구독·제목 2줄)가
 * 그 위에 얹힙니다. 헤더는 `MBN AI` 브랜드 + 언어칩입니다.
 *
 * ⚠️ 숏폼 전용 도메인이 없습니다. 지금은 **영상 콘텐츠를 그대로** 재생 자리에 놓습니다
 *    (`Content.type=VIDEO`). `SHORTFORM` 타입 추가 여부는 개편 2단계 결정 사항입니다.
 * ⚠️ 좋아요·구독 토글은 아직 붙이지 않았습니다 — 영상 상세(`/videos/:id`)에 이미
 *    동작하는 구현이 있으니 계약이 정해지면 그쪽을 재사용하세요.
 */
export default function ShortformPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const contentId = Number(id);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["content", contentId],
    queryFn: () => api.getContent(contentId),
    enabled: Number.isFinite(contentId),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className={styles.page}>
      {/* 다른 상세 화면과 같이 `매일{아티스트}` 브랜드 모드로 둡니다.
          여기만 "MBN AI" 로 떠서 아티스트 공간을 벗어난 것처럼 보였습니다. */}
      <HeaderBack />

      <div className={styles.stage}>
        <img src={data.thumbnailUrl} alt="" />

        <div className={styles.rail}>
          <button className={styles.railItem} aria-label={t("content.like")}>
            <Icon name="heartFilled" size={24} />
            <span>{formatCount(data.likeCount)}</span>
          </button>
          <button className={styles.railItem} aria-label={t("comment.title")}>
            <Icon name="chatBubble" size={24} />
            <span>{formatCount(data.commentCount)}</span>
          </button>
          <button className={styles.railItem}>
            <Icon name="share" size={24} />
            <span>{t("content.share")}</span>
          </button>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.channelRow}>
          <span className={styles.channelAvatar} aria-hidden>
            {data.channel?.name ? Array.from(data.channel.name)[0] : "M"}
          </span>
          <span className={styles.channelName}>{data.channel?.name}</span>
          <button className={styles.subscribe}>{t("content.subscribe")}</button>
        </div>
        <p className={styles.title}>{data.title}</p>
      </div>
    </div>
  );
}
