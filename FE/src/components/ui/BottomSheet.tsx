import { useEffect, type ReactNode } from "react";

import styles from "./BottomSheet.module.css";

/**
 * DIM + Bottom Sheet 오버레이. 언어 선택(6:1056)과 음성 AI(7:1432~) 가 공유합니다.
 *
 * 딤을 탭하거나 ESC 를 누르면 닫힙니다.
 *
 * `overflowVisible` 은 음성 오버레이 전용입니다 — 마스코트가 시트 위로 튀어나와야 해서
 * `overflow` 를 자르면 안 됩니다.
 */
type Props = {
  title?: string;
  /** 손잡이 바를 숨깁니다 (음성 오버레이는 디자인에 손잡이가 없습니다) */
  hideHandle?: boolean;
  overflowVisible?: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function BottomSheet({
  title,
  hideHandle = false,
  overflowVisible = false,
  onClose,
  children,
}: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <button className={styles.dim} aria-label="Close" onClick={onClose} />
      <div
        className={`${styles.sheet} ${overflowVisible ? "" : styles.scrollable}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {!hideHandle && <div className={styles.handle} aria-hidden />}
        {title ? <h2 className={styles.title}>{title}</h2> : null}
        {children}
      </div>
    </>
  );
}
