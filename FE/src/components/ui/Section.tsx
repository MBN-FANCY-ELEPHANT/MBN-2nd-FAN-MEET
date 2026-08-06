import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import styles from "./Section.module.css";

/**
 * 섹션 헤더 + 우측 "전체 보기 >" 링크.
 * 와이어프레임의 아카이브 / 모집 중인 모임 / 다양한 팁 섹션이 모두 이 형태입니다.
 */
export default function Section({
  title,
  seeAllTo,
  children,
}: {
  title: string;
  seeAllTo?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {seeAllTo && (
          <Link to={seeAllTo} className={styles.seeAll}>
            {t("app.seeAll")} <span aria-hidden>›</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
