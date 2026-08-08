import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ApiError, api } from "../../api/client";
import { artistPhoto } from "../../data/programs";
import HeaderBack from "../../components/layout/HeaderBack";
import { ErrorState, LoadingState } from "../../components/ui/States";
import { useToast } from "../../components/ui/useToast";
import { isUnauthorized } from "../../features/auth/useAuth";
import { formatDate, formatTime } from "../../lib/format";
import styles from "./ConcertEntry.module.css";
import { getSelectedArtist, getSelectedStarId } from "../../features/artist/selectedArtist";

/**
 * 공연 응모.
 *
 * <p>흐름은 **응모 → 응모 완료 → 응모 취소** 세 상태뿐입니다.
 *
 * ⚠️ **매수 선택이 없습니다.** 1인 1공연 **1매** 고정이고 「응모하기」 버튼 하나로 끝납니다.
 *    이전 구현에는 1~4매 선택기가 있었는데 디자인 확정 과정에서 빠졌습니다 —
 *    되살리려면 `docs/api-spec.yaml` 의 `POST /schedules/{id}/entry` 부터 고쳐야 합니다.
 *
 * ⚠️ **응모는 추첨 신청이지 결제가 아닙니다.** 당첨 이후 실제 예매는 공식 예매처에서
 *    이뤄지고 플랫폼은 금전 거래를 중개하지 않습니다. 이 고지를 화면에서 빼지 마세요.
 *
 * 음성 도우미의 "가장 가까운 공연 응모해줘" 도 **같은 서버 API** 를 호출합니다.
 * 경로가 둘로 갈라지면 규칙(1인 1매)이 어긋납니다.
 */
export default function ConcertEntryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const scheduleId = Number(id);
  const enabled = Number.isFinite(scheduleId);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => api.getSchedule(scheduleId),
    enabled,
  });

  const { data: entry } = useQuery({
    queryKey: ["concertEntry", scheduleId],
    queryFn: () => api.getConcertEntry(scheduleId),
    enabled,
  });

  /** 응모·취소 후 이 화면과 공연 탭의 「응모 내역」이 함께 갱신돼야 합니다. */
  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["concertEntry"] });
    void queryClient.invalidateQueries({ queryKey: ["myEntries", getSelectedStarId()] });
  }

  const apply = useMutation({
    mutationFn: () => api.enterConcert(scheduleId),
    onSuccess: () => {
      refresh();
      toast("success", t("concert.entryDone"));
    },
    onError: (error) => toast("error", entryErrorMessage(error, t)),
  });

  const cancel = useMutation({
    mutationFn: () => api.cancelConcertEntry(scheduleId),
    onSuccess: () => {
      refresh();
      toast("info", t("concert.entryCanceled"));
    },
    onError: (error) => toast("error", entryErrorMessage(error, t)),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const open = new Date(data.startAt).getTime() > Date.now();
  const entered = entry?.entered === true;
  const busy = apply.isPending || cancel.isPending;

  return (
    <div className={styles.page}>
      <HeaderBack />

      <img
        className={styles.poster}
        src={artistPhoto(getSelectedArtist(), data.id)}
        alt=""
      />

      <div className={styles.sheet}>
        <span className={`${styles.badge} ${open ? "" : styles.badgeClosed}`}>
          {t(open ? "fanspace.entryOpen" : "fanspace.entryClosed")}
        </span>
        <h1 className={styles.title}>{data.title}</h1>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>{t("concert.when")}</dt>
            <dd>
              {formatDate(data.startAt)} {formatTime(data.startAt)}
            </dd>
          </div>
          {data.venue && (
            <div className={styles.fact}>
              <dt>{t("concert.where")}</dt>
              <dd>{data.venue}</dd>
            </div>
          )}
          <div className={styles.fact}>
            <dt>{t("concert.seats")}</dt>
            {/* 1인 1매 — 고를 것이 없으므로 규칙을 그냥 알려줍니다 */}
            <dd>{t("concert.oneSeatOnly")}</dd>
          </div>
        </dl>

        {data.description && (
          <p className={styles.description}>{data.description}</p>
        )}

        {entered && (
          <div className={styles.doneCard}>
            <p className={styles.doneTitle}>{t("concert.entryDoneTitle")}</p>
            <p className={styles.doneMeta}>
              {t("concert.oneSeatOnly")}
              {entry?.enteredAt ? ` · ${formatDate(entry.enteredAt)}` : ""}
            </p>
          </div>
        )}

        {/* ⚠️ 결제가 아니라는 고지 — 정책상 필수입니다 */}
        <p className={styles.notice}>{t("concert.paymentNotice")}</p>

        <div className={styles.actions}>
          {entered ? (
            <button
              className={styles.secondary}
              onClick={() => cancel.mutate()}
              disabled={busy}
            >
              {t("concert.cancel")}
            </button>
          ) : (
            <button
              className={styles.primary}
              onClick={() => apply.mutate()}
              disabled={!open || busy}
            >
              {t(open ? "concert.apply" : "fanspace.entryClosed")}
            </button>
          )}
          <button
            className={styles.secondary}
            onClick={() => navigate("/fanspace/concert")}
          >
            {t("concert.backToList")}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 응모 실패 사유를 문장으로. `ApiError.code` 분기는 모임 신청과 같은 어법입니다.
 *
 * ⚠️ 401 은 "로그인이 필요합니다" 로 따로 잡습니다. 닉네임 룰렛이 로그인을 대신하지만
 *    쓰기 API 는 데모 계정 토큰이 필요해서, 토큰 발급이 실패하면 여기로 옵니다.
 */
function entryErrorMessage(
  error: unknown,
  t: (key: string) => string,
): string {
  if (isUnauthorized(error)) return t("concert.loginRequired");
  if (error instanceof ApiError) {
    if (error.code === "ENTRY_ALREADY_EXISTS") return t("concert.alreadyEntered");
    if (error.code === "ENTRY_CLOSED") return t("concert.entryClosedError");
    if (error.code === "ENTRY_NOT_FOUND") return t("concert.entryNotFound");
  }
  return t("toast.genericError");
}
