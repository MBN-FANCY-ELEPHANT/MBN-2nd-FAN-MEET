import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import FeedThread from "../components/feed/FeedThread";
import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import HeaderBack from "../components/layout/HeaderBack";
import { ErrorState } from "../components/ui/States";
import { currentLocale } from "../i18n";
import { contentRoute } from "../lib/contentRoute";
import styles from "./FeedPage.module.css";

/**
 * 소식 탭 — 활동 기록 스레드.
 *
 * 스레드 자체는 **메인페이지와 공유하는 `FeedThread`** 가 그립니다 (아티스트 글 ·
 * 팬매니저 공지 · 무대 롱폼 3종, 전부 Content API 실데이터 + 좋아요/댓글).
 *
 * 이 화면만의 것은 맨 위 **AI 소식 요약** 하나입니다 — 카드를 열 개 읽지 않아도
 * "이번 주에 무슨 일이 있었는지"를 알 수 있어야 하기 때문입니다.
 */
export default function FeedPage() {
  const { t } = useTranslation();
  const locale = currentLocale();

  return (
    <div className={styles.page}>
      <HeaderBack />
      <div className={styles.sheet}>
        <h2 className={styles.title}>{t("feed.title")}</h2>

        <NewsDigestCard locale={locale} />

        <FeedThread />

      </div>
    </div>
  );
}

/**
 * AI 소식 요약 — 스레드 맨 위 고정 카드.
 *
 * ⚠️ 작성 주체는 **AI 도우미 "비엔이"** 입니다. 스타 본인의 말투를 흉내내지 않습니다
 *    (기획서 5-2). 그래서 헤더에 AI 라벨과 생성 안내를 항상 붙입니다.
 *
 * 서버가 캐시를 채우기 전 첫 요청은 LLM 왕복이라 느립니다. 그동안은 스켈레톤을 띄우고,
 * 실패하면 카드 자체를 접습니다 — 소식 스레드는 이게 없어도 성립합니다.
 */
function NewsDigestCard({ locale }: { locale: string }) {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["newsDigest", STAR_ID, locale],
    queryFn: () => api.getNewsDigest(STAR_ID),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  if (isError) {
    return (
      <div className={styles.digest}>
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <section className={styles.digest}>
      <div className={styles.digestHead}>
        <span className={styles.digestBadge}>{t("feed.digestBadge")}</span>
        <h3 className={styles.digestTitle}>{t("feed.digestTitle")}</h3>
      </div>

      {isPending ? (
        <div className={styles.digestSkeleton} aria-hidden>
          <span />
          <span />
          <span />
        </div>
      ) : (
        <>
          <p className={styles.digestSummary}>{data.summary}</p>

          <dl className={styles.digestItems}>
            {data.items?.map((item) => (
              <div key={item.title} className={styles.digestItem}>
                <dt className={styles.digestItemTitle}>{item.title}</dt>
                <dd className={styles.digestItemBody}>{item.body}</dd>
              </div>
            ))}
          </dl>

          {data.sources && data.sources.length > 0 && (
            <div className={styles.digestSources}>
              <p className={styles.digestSourceLabel}>{t("feed.digestSources")}</p>
              <div className={styles.digestSourceList}>
                {data.sources.map((source) => (
                  <Link
                    key={source.contentId}
                    className={styles.digestSource}
                    to={contentRoute({ id: source.contentId, type: source.type })}
                  >
                    {source.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <p className={styles.digestNotice}>{t("feed.digestNotice")}</p>
    </section>
  );
}
