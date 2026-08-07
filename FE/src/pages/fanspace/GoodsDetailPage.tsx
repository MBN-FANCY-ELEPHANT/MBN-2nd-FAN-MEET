import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import exampleHero from "../../assets/example/example_hero.png";
import HeaderBack from "../../components/layout/HeaderBack";
import { EmptyState } from "../../components/ui/States";
import { findGoods } from "../../data/goods";
import CheckoutSheet from "./CheckoutSheet";
import styles from "./GoodsDetail.module.css";

/**
 * 굿즈 상세 (Figma 27:6651).
 *
 * ⚠️ **가격은 여전히 표시 전용입니다.** 플랫폼은 금전 거래를 중개하지 않습니다
 *    (`docs/mvp-scope.md` 컷 목록 — 결제/송금). 아래 "구매하기" → `CheckoutSheet` 는
 *    **실제 결제를 처리하지 않는 UI 목업**입니다 — 확정을 눌러도 서버 호출 없이
 *    로컬 Toast만 뜨고 닫힙니다. 실제 결제 연동은 여전히 스코프 밖입니다.
 *
 * ⚠️ 굿즈 도메인이 BE 에 없어 정적 더미이고, 상품 이미지도 예시를 돌려 씁니다.
 */
export default function GoodsDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const goods = findGoods(Number(id));
  const [checkoutOpen, setCheckoutOpen] = useState(false);

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

        <p className={styles.notice}>{t("fanspace.goodsNotice")}</p>
      </div>

      <div className={styles.actionBar}>
        <button className={styles.cta} onClick={() => setCheckoutOpen(true)}>
          {t("fanspace.goodsOpenShop")}
        </button>
      </div>

      {checkoutOpen && (
        <CheckoutSheet goods={goods} onClose={() => setCheckoutOpen(false)} />
      )}
    </div>
  );
}
