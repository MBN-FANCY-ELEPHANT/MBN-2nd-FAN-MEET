import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ApiError, api, type Comment } from "../../api/client";
import { formatTime } from "../../lib/format";
import Icon from "../ui/Icon";
import { useToast } from "../ui/useToast";
import styles from "./Reply.module.css";

/**
 * 댓글 한 건 (Figma 2:994).
 *
 * **이 컴포넌트가 "글로벌 트롯 팬덤"을 증명합니다** — 국가 배지와 번역 버튼이 함께 있어서
 * 여러 나라 팬이 같은 콘텐츠에서 소통하는 장면이 한 화면에 담깁니다 (골든 패스 ④).
 *
 * 번역은 토글입니다. 한 번 누르면 현재 UI 언어로 번역하고, 다시 누르면 원문으로 돌아옵니다.
 * 서버가 `(댓글, 언어)` 단위로 캐싱하므로 두 번째부터는 즉시 옵니다.
 */

/** 국가 코드 → 표시 라벨. 디자인은 "한국" 처럼 한글 국가명을 씁니다. */
const COUNTRY_LABEL: Record<string, string> = {
  KR: "한국",
  US: "미국",
  JP: "일본",
  FR: "프랑스",
  ES: "스페인",
  CN: "중국",
  RU: "러시아",
};

export default function Reply({ comment }: { comment: Comment }) {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [translated, setTranslated] = useState<string | null>(null);
  const [showingTranslation, setShowingTranslation] = useState(false);

  const translate = useMutation({
    mutationFn: () => api.translateComment(comment.id),
    onSuccess: (result) => {
      setTranslated(result.translatedBody);
      setShowingTranslation(true);
    },
    onError: () => toast("error", t("toast.translateFailed")),
  });

  const toggleLike = useMutation({
    mutationFn: () =>
      comment.liked
        ? api.unlikeComment(comment.id)
        : api.likeComment(comment.id),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ["comments", comment.contentId],
      }),
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : "UNKNOWN";
      toast(
        "error",
        t(
          code === "UNAUTHORIZED" ? "auth.loginRequired" : "toast.genericError",
        ),
      );
    },
  });

  const onTranslateTap = () => {
    // 이미 번역해 뒀으면 서버를 다시 부르지 않고 토글만 합니다.
    if (translated) {
      setShowingTranslation((prev) => !prev);
      return;
    }
    translate.mutate();
  };

  return (
    <article className={styles.reply}>
      <div className={styles.head}>
        <div className={styles.author}>
          <img
            className={styles.avatar}
            src={comment.author.profileImageUrl}
            alt=""
          />
          <div className={styles.nameRow}>
            <span className={styles.nickname}>{comment.author.nickname}</span>
            <span className={styles.country}>
              {COUNTRY_LABEL[comment.author.country] ?? comment.author.country}
            </span>
          </div>
        </div>
        <span className={styles.time}>
          {t("comment.writtenAt", { time: formatTime(comment.createdAt) })}
        </span>
      </div>

      <div>
        <div className={styles.bodyRow}>
          <p className={styles.body}>
            {showingTranslation && translated ? translated : comment.body}
          </p>
          <button
            className={`${styles.translate} ${showingTranslation ? styles.translateActive : ""}`}
            onClick={onTranslateTap}
            disabled={translate.isPending}
            aria-label={
              showingTranslation
                ? t("comment.showOriginal")
                : t("comment.translate")
            }
          >
            <Icon name="translate" size={18} />
          </button>
        </div>
        {showingTranslation && (
          <p className={styles.translated}>{t("comment.translate")}</p>
        )}
      </div>

      <div className={styles.likeRow}>
        <button
          className={`${styles.like} ${comment.liked ? styles.likeActive : ""}`}
          onClick={() => toggleLike.mutate()}
          disabled={toggleLike.isPending}
          aria-label={t("content.like")}
          aria-pressed={comment.liked}
        >
          <Icon name="heart" size={24} />
          {comment.likeCount}
        </button>
      </div>
    </article>
  );
}
