import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../../api/client";
import exampleHero from "../../assets/example/example_hero.png";
import HeaderBack from "../../components/layout/HeaderBack";
import { ErrorState, LoadingState } from "../../components/ui/States";
import { useToast } from "../../components/ui/useToast";
import {
  MAX_SEATS,
  cancelEntry,
  enter,
  findEntry,
} from "../../features/concert/concertEntry";
import { formatDate, formatTime } from "../../lib/format";
import styles from "./ConcertEntry.module.css";

/**
 * 공연 응모 (Figma 22:4264 공연 탭의 목적지).
 *
 * 흐름은 **응모 → 응모 완료 → 응모 취소** 세 상태뿐입니다. 중장년 사용자가 주 대상이라
 * 단계를 늘리지 않았습니다.
 *
 * ⚠️ **응모는 추첨 신청이지 결제가 아닙니다.** 당첨 이후 실제 예매는 공식 예매처에서
 *    이뤄지고 플랫폼은 금전 거래를 중개하지 않습니다. 이 고지를 화면에서 빼지 마세요.
 *
 * ⚠️ 응모 상태는 BE 계약이 없어 **이 기기 로컬 저장**입니다
 *    (`features/concert/concertEntry.ts` 주석 참고).
 */
export default function ConcertEntryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const scheduleId = Number(id);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => api.getSchedule(scheduleId),
    enabled: Number.isFinite(scheduleId),
  });

  const [entry, setEntry] = useState(() => findEntry(scheduleId));
  const [seats, setSeats] = useState(() => findEntry(scheduleId)?.seats ?? 1);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const open = new Date(data.startAt).getTime() > Date.now();

  function apply() {
    enter(scheduleId, seats, new Date().toISOString());
    setEntry(findEntry(scheduleId));
    toast("success", t("concert.entryDone"));
  }

  function cancel() {
    cancelEntry(scheduleId);
    setEntry(undefined);
    toast("info", t("concert.entryCanceled"));
  }

  return (
    <div className={styles.page}>
      <HeaderBack />

      <img className={styles.poster} src={exampleHero} alt="" />

      <div className={styles.sheet}>
        <span
          className={`${styles.badge} ${open ? "" : styles.badgeClosed}`}
        >
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
            <dd>{t("concert.seatsLimit", { max: MAX_SEATS })}</dd>
          </div>
        </dl>

        {data.description && (
          <p className={styles.description}>{data.description}</p>
        )}

        {/* 응모 전에만 매수를 고릅니다. 응모 뒤에는 고른 값을 확인만 합니다 */}
        {open && !entry && (
          <div className={styles.seatPicker}>
            <p className={styles.seatLabel}>{t("concert.seatPick")}</p>
            <div className={styles.seatOptions}>
              {Array.from({ length: MAX_SEATS }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.seatOption} ${seats === n ? styles.seatOptionOn : ""}`}
                  onClick={() => setSeats(n)}
                  aria-pressed={seats === n}
                >
                  {t("concert.seatCount", { count: n })}
                </button>
              ))}
            </div>
          </div>
        )}

        {entry && (
          <div className={styles.doneCard}>
            <p className={styles.doneTitle}>{t("concert.entryDoneTitle")}</p>
            <p className={styles.doneMeta}>
              {t("concert.seatCount", { count: entry.seats })} ·{" "}
              {formatDate(entry.entredAt)}
            </p>
          </div>
        )}

        {/* ⚠️ 결제가 아니라는 고지 — 정책상 필수입니다 */}
        <p className={styles.notice}>{t("concert.paymentNotice")}</p>

        <div className={styles.actions}>
          {entry ? (
            <button className={styles.secondary} onClick={cancel}>
              {t("concert.cancel")}
            </button>
          ) : (
            <button
              className={styles.primary}
              onClick={apply}
              disabled={!open}
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
