import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ApiError, api } from "../api/client";
import HeaderBack from "../components/layout/HeaderBack";
import Icon from "../components/ui/Icon";
import ProgressBar from "../components/ui/ProgressBar";
import StatusBadge from "../components/ui/StatusBadge";
import { ErrorState, LoadingState } from "../components/ui/States";
import { useToast } from "../components/ui/useToast";
import { formatDate, formatDeadline } from "../lib/format";
import styles from "./GatheringDetailPage.module.css";

/**
 * 모임 상세 (Figma 7:1923) — ★골든 패스의 마지막 구간.
 *
 * **이 화면의 핵심은 "참가 신청 → 진행률이 눈앞에서 바뀌는 것"입니다.**
 * 신청이 성공하면 쿼리를 무효화해 34/40 → 35/40 으로 즉시 갱신하고 Toast 를 띄웁니다.
 *
 * ⚠️ **정책**: `fee` 는 표시 전용입니다. 플랫폼은 금전 거래를 중개하지 않으며,
 * 그 고지를 디자인 안내 문구와 **함께** 노출합니다 (CLAUDE.md 정책 4 — 협상 대상 아님).
 */

/** 서버 에러 코드 → 사용자에게 보여줄 문구. 코드별로 다르게 안내해야 다음 행동이 정해집니다. */
const ERROR_MESSAGE: Record<string, string> = {
  GATHERING_ALREADY_APPLIED: "toast.alreadyApplied",
  GATHERING_FULL: "toast.gatheringFull",
  GATHERING_CLOSED: "toast.gatheringClosed",
  UNAUTHORIZED: "auth.loginRequired",
};

export default function GatheringDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const gatheringId = Number(id);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["gathering", gatheringId],
    queryFn: () => api.getGathering(gatheringId),
    enabled: Number.isFinite(gatheringId),
  });

  const applied = data?.myApplication?.status === "APPLIED";

  const invalidate = () => {
    // 상세뿐 아니라 목록·HOME 의 진행률도 함께 갱신합니다.
    void queryClient.invalidateQueries({
      queryKey: ["gathering", gatheringId],
    });
    void queryClient.invalidateQueries({ queryKey: ["gatherings"] });
    void queryClient.invalidateQueries({ queryKey: ["home"] });
  };

  const apply = useMutation({
    mutationFn: () => api.applyGathering(gatheringId),
    onSuccess: () => {
      invalidate();
      toast("success", t("toast.applySuccess"));
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : "UNKNOWN";
      toast("error", t(ERROR_MESSAGE[code] ?? "toast.genericError"));
      // 정원 마감처럼 서버 상태가 이미 바뀐 경우가 있어 최신 상태를 다시 받아옵니다.
      invalidate();
    },
  });

  const cancel = useMutation({
    mutationFn: () => api.cancelGatheringApplication(gatheringId),
    onSuccess: () => {
      invalidate();
      toast("info", t("toast.cancelSuccess"));
    },
    onError: () => toast("error", t("toast.genericError")),
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

  const closed = data.status !== "RECRUITING";
  const pending = apply.isPending || cancel.isPending;

  return (
    <div className={styles.page}>
      <HeaderBack />

      <div className={styles.cover}>
        <img src={data.coverImageUrl} alt="" />
      </div>

      <div className={styles.body}>
        {/* 배지 → 제목 사이 간격이 제목 → 요약 사이보다 큽니다 (Figma 7:1928 gap 16) */}
        <div className={styles.head}>
          <StatusBadge status={data.status} />
          <h1 className={styles.title}>{data.title}</h1>
        </div>
        <p className={styles.summary}>{data.summary}</p>

        <div className={styles.hostRow}>
          <span className={styles.host}>
            {data.official && <span className={styles.official}>MBN</span>}
            {data.hostNickname}
          </span>
          <span className={styles.deadline}>
            {formatDeadline(data.deadline)}
          </span>
        </div>

        <div className={styles.info}>
          <div className={styles.infoRow}>
            <Icon name="calendar" size={24} />
            <span>{formatDate(data.eventAt)}</span>
          </div>
          <div className={styles.infoRow}>
            <Icon name="mapMarker" size={24} />
            <span>{data.meetingPoint}</span>
          </div>
          <div className={styles.infoRow}>
            <Icon name="wallet" size={24} />
            {/* fee 는 표시 전용입니다. 플랫폼은 결제를 중개하지 않습니다 */}
            <span>
              {data.fee > 0
                ? `${data.fee.toLocaleString()}${t("fanspace.currency")}`
                : t("gathering.free")}
            </span>
          </div>
        </div>

        {data.notice && <p className={styles.notice}>{data.notice}</p>}

        {/* 정책상 반드시 노출 — 디자인 안내 문구와 별개로 병기합니다 */}
        <p className={styles.paymentWarning}>{t("gathering.paymentWarning")}</p>

        {data.description && (
          <p className={styles.description}>{data.description}</p>
        )}
      </div>

      <div className={styles.actionBar}>
        <div className={styles.progress}>
          {/* 진행바 색만으로 정보를 전달하지 않도록 숫자를 항상 함께 노출 */}
          <div className={styles.progressLabel}>
            {t("gathering.progress", {
              current: data.currentCount,
              capacity: data.capacity,
            })}
          </div>
          <ProgressBar current={data.currentCount} capacity={data.capacity} />
        </div>

        <button
          className={`${styles.cta} ${applied ? styles.ctaApplied : ""}`}
          disabled={pending || (closed && !applied)}
          onClick={() => (applied ? cancel.mutate() : apply.mutate())}
        >
          {applied
            ? t("gathering.cancel")
            : closed
              ? t(`gathering.status.${data.status}`)
              : t("gathering.apply")}
        </button>
      </div>
    </div>
  );
}
