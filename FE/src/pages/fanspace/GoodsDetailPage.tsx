import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import exampleHero from "../../assets/example/example_hero.png";
import HeaderBack from "../../components/layout/HeaderBack";
import { EmptyState } from "../../components/ui/States";
import { findGoods } from "../../data/goods";
import styles from "./GoodsDetail.module.css";

/**
 * 굿즈 상세 (Figma 27:6651).
 *
 * ⚠️ **가격은 표시 전용입니다.** 플랫폼은 금전 거래를 중개하지 않습니다
 *    (`CLAUDE.md` 정책 4 — 모임 참가비와 같은 원칙). 결제 버튼을 붙이지 마세요.
 *    하단 CTA 는 공식 판매처로 보내는 **외부 링크**입니다.
 *
 * ⚠️ 굿즈 도메인이 BE 에 없어 정적 더미이고, 상품 이미지도 예시를 돌려 씁니다.
 */
export default function GoodsDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const goods = findGoods(Number(id));

  if (!goods) {
    return (
      <div className={styles.page}>
        <HeaderBack />
        <EmptyState message={t("list.empty")} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <HeaderBack />

      <img className={styles.photo} src={exampleHero} alt="" />

      <div className={styles.body}>
        <p className={styles.category}>
          {t(`fanspace.goodsCategory.${goods.category}`)}
        </p>
        <h1 className={styles.name}>{goods.name}</h1>
        <p className={styles.price}>
          {goods.price.toLocaleString()}
          {t("fanspace.currency")}
        </p>

        <p className={styles.description}>{goods.description}</p>

        {/* 결제가 아니라 공식 판매처 안내입니다 */}
        <p className={styles.notice}>{t("fanspace.goodsNotice")}</p>
      </div>

      <div className={styles.actionBar}>
        <a
          className={styles.cta}
          href={goods.shopUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {t("fanspace.goodsOpenShop")}
        </a>
      </div>
    </div>
  );
}
