import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import HeaderBack from "../components/layout/HeaderBack";
import ChipRow from "../components/ui/ChipRow";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { formatDate } from "../lib/format";
import styles from "./ListPage.module.css";

/**
 * 일정 전체 목록 — HOME 의 `다가오는 일정` 확장.
 *
 * ⚠️ **디자인에 없는 화면입니다.** HOME 은 가장 가까운 1건만 보여주는데, 팬 입장에서
 * "앞으로 뭐가 있지?"를 확인할 곳이 필요해서 만들었습니다.
 * 지난 일정도 볼 수 있게 필터를 두되 기본은 예정만 보여줍니다.
 */

type Filter = "UPCOMING" | "ALL";

export default function ScheduleListPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("UPCOMING");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["schedules", STAR_ID, filter],
    queryFn: () =>
      api.getSchedules({
        starId: STAR_ID,
        upcoming: filter === "UPCOMING",
        size: 50,
      }),
  });

  const now = Date.now();

  return (
    <div className={styles.page}>
      <HeaderBack title={t("home.upcomingSchedule")} />

      <div className={styles.body}>
        <ChipRow
          options={[
            { value: "UPCOMING" as const, label: t("list.upcoming") },
            { value: "ALL" as const, label: t("list.all") },
          ]}
          value={filter}
          onChange={setFilter}
        />

        {isPending && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}

        {data && data.content?.length === 0 && (
          <EmptyState message={t("home.noSchedule")} />
        )}

        <div className={styles.stack}>
          {data?.content?.map((schedule) => {
            const past = new Date(schedule.startAt).getTime() < now;
            return (
              <div
                key={schedule.id}
                className={`${styles.schedule} ${past ? styles.past : ""}`}
              >
                <div className={styles.scheduleHead}>
                  <span className={styles.scheduleDate}>
                    {formatDate(schedule.startAt)}
                  </span>
                  <span className={styles.scheduleType}>
                    {t(`schedule.type.${schedule.type}`)}
                  </span>
                </div>
                <p className={styles.scheduleTitle}>{schedule.title}</p>
                {schedule.venue && (
                  <p className={styles.scheduleVenue}>{schedule.venue}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
