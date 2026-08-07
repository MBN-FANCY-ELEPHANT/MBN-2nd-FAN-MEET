import { useState } from "react";
import { useTranslation } from "react-i18next";

import { goodsImage } from "../../data/goods";
import BottomSheet from "../../components/ui/BottomSheet";
import { useToast } from "../../components/ui/useToast";
import type { Goods } from "../../data/goods";
import styles from "./CheckoutSheet.module.css";

const METHODS = ["card", "transfer", "simple"] as const;
type Method = (typeof METHODS)[number];

const PROVIDERS = ["naver", "kakao"] as const;
type Provider = (typeof PROVIDERS)[number];

const MAX_QUANTITY = 10;

/**
 * 결제수단 선택 바텀시트 — **UI 목업입니다.**
 *
 * ⚠️ 실제 결제를 처리하지 않습니다. 플랫폼은 금전 거래를 중개하지 않는다는 원칙은
 * 그대로이고(`docs/mvp-scope.md` 컷 목록 — 결제/송금), 이 화면은 그 원칙 위에서
 * "결제하기를 누르면 무슨 화면이 뜨는지"만 보여주는 데모용 껍데기입니다.
 * 확정 버튼을 눌러도 서버에 아무것도 전송되지 않고, 로컬 Toast만 뜨고 닫힙니다.
 */
export default function CheckoutSheet({
  goods,
  onClose,
}: {
  goods: Goods;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [method, setMethod] = useState<Method>("card");
  const [provider, setProvider] = useState<Provider>("naver");
  const [quantity, setQuantity] = useState(1);

  const total = goods.price * quantity;

  function confirm() {
    toast("success", t("checkout.successToast"));
    onClose();
  }

  return (
    <BottomSheet title={t("checkout.title")} onClose={onClose}>
      <div className={styles.summary}>
        <img className={styles.thumb} src={goodsImage(goods.category)} alt="" />
        <div className={styles.summaryBody}>
          <p className={styles.summaryName}>{goods.name}</p>
          <p className={styles.summaryPrice}>
            {goods.price.toLocaleString()}
            {t("fanspace.currency")}
          </p>
        </div>
      </div>

      <div className={styles.quantityRow}>
        <span className={styles.sectionLabel}>{t("checkout.quantityLabel")}</span>
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.stepperButton}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label={t("checkout.quantityDecrease")}
          >
            −
          </button>
          <span className={styles.stepperValue}>{quantity}</span>
          <button
            type="button"
            className={styles.stepperButton}
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            disabled={quantity >= MAX_QUANTITY}
            aria-label={t("checkout.quantityIncrease")}
          >
            +
          </button>
        </div>
      </div>

      <p className={styles.sectionLabel}>{t("checkout.methodLabel")}</p>
      <div
        className={styles.methods}
        role="radiogroup"
        aria-label={t("checkout.methodLabel")}
      >
        {METHODS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={method === value}
            className={`${styles.method} ${method === value ? styles.methodActive : ""}`}
            onClick={() => setMethod(value)}
          >
            <span
              className={`${styles.radio} ${method === value ? styles.radioActive : ""}`}
              aria-hidden
            />
            {t(`checkout.method.${value}`)}
          </button>
        ))}
      </div>

      {method === "simple" && (
        <div
          className={styles.providers}
          role="radiogroup"
          aria-label={t("checkout.methodLabel")}
        >
          {PROVIDERS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={provider === value}
              className={`${styles.provider} ${styles[`provider_${value}`]} ${
                provider === value ? styles.providerActive : ""
              }`}
              onClick={() => setProvider(value)}
            >
              {t(`checkout.provider.${value}`)}
            </button>
          ))}
        </div>
      )}

      <button className={styles.payButton} onClick={confirm}>
        {t("checkout.payButton", {
          amount: total.toLocaleString() + t("fanspace.currency"),
        })}
      </button>
    </BottomSheet>
  );
}
