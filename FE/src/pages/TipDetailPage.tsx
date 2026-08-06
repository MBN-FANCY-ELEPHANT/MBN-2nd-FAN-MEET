import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { api } from "../api/client";
import HeaderBack from "../components/layout/HeaderBack";
import { ErrorState, LoadingState } from "../components/ui/States";
import { formatDate } from "../lib/format";
import styles from "./ListPage.module.css";

/**
 * 팁 상세 — 응원하기 카드의 목적지.
 *
 * ⚠️ **디자인에 없는 화면입니다.** 팁 본문이 마크다운이라 최소 렌더러를 붙였습니다.
 * 마크다운 라이브러리를 넣지 않은 이유: 시드 본문이 `##` 제목과 `-` 목록만 쓰기 때문에
 * 의존성을 늘릴 이유가 없습니다.
 *
 * `updatedAt` 은 **항상 노출**합니다 — 투표·스밍 정책이 자주 바뀌어서
 * 언제 기준 안내인지가 정보의 신뢰도를 좌우합니다.
 */
export default function TipDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const tipId = Number(id);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["tip", tipId],
    queryFn: () => api.getTip(tipId),
    enabled: Number.isFinite(tipId),
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

  const lines = (data.content ?? "").split("\n");

  return (
    <div className={styles.page}>
      <HeaderBack />
      <img className={styles.tipHero} src={data.thumbnailUrl} alt="" />

      <div className={styles.body}>
        <h1 className={styles.tipTitle}>{data.title}</h1>
        <p className={styles.tipUpdated}>
          {t("tip.updatedAt", { date: formatDate(data.updatedAt) })}
        </p>

        <div className={styles.tipContent}>
          {lines.map((line, index) =>
            line.startsWith("##") ? (
              <p key={index} className={styles.tipHeading}>
                {line.replace(/^#+\s*/, "")}
              </p>
            ) : line.trim() ? (
              <p key={index} className={styles.tipLine}>
                {line}
              </p>
            ) : null,
          )}
        </div>

        {data.externalUrl && (
          <a
            className={styles.externalLink}
            href={data.externalUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            {t("tip.openExternal")}
          </a>
        )}
      </div>
    </div>
  );
}
