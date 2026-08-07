import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ApiError, api } from "../api/client";
import Reply from "../components/comment/Reply";
import HeaderBack from "../components/layout/HeaderBack";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useToast } from "../components/ui/useToast";
import { useAuth } from "../features/auth/useAuth";
import styles from "./CommentPage.module.css";

/**
 * 댓글 화면 (Figma 6:473).
 *
 * 기사·영상·아티스트 글이 공유합니다. 서버 조회는 `/contents/{id}/comments` 하나이며
 * 대댓글 없이 1단계 댓글만 표시합니다.
 *
 * 비로그인이면 입력창을 비활성화합니다. 조회는 누구나 가능해야 하니까요.
 */
export default function CommentPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const contentId = Number(id);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const [draft, setDraft] = useState("");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["comments", contentId],
    queryFn: () => api.getComments(contentId, { size: 50 }),
    enabled: Number.isFinite(contentId),
  });

  const create = useMutation({
    mutationFn: (body: string) => api.createComment(contentId, body),
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["comments", contentId] });
      void queryClient.invalidateQueries({ queryKey: ["content", contentId] });
    },
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

  return (
    <div className={styles.page}>
      <HeaderBack title={t("comment.title")} />

      <div className={styles.list}>
        {isPending && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {data?.content?.length === 0 && (
          <EmptyState message={t("comment.empty")} />
        )}
        {data?.content?.map((comment) => (
          <Reply key={comment.id} comment={comment} />
        ))}
      </div>

      <form
        className={styles.composer}
        onSubmit={(e) => {
          e.preventDefault();
          const body = draft.trim();
          if (body) create.mutate(body);
        }}
      >
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            isAuthenticated
              ? t("comment.placeholder")
              : t("comment.loginRequired")
          }
          disabled={!isAuthenticated || create.isPending}
          maxLength={500}
        />
        <button
          className={styles.send}
          type="submit"
          disabled={!isAuthenticated || !draft.trim() || create.isPending}
          aria-label={t("comment.send")}
        >
          <span aria-hidden>➤</span>
        </button>
      </form>
    </div>
  );
}
