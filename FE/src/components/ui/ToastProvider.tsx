import { useCallback, useRef, useState, type ReactNode } from "react";

import styles from "./Toast.module.css";
import { ToastContext, type ToastKind } from "./useToast";

/**
 * Toast (Figma 2:1233) — Success / Error / Info 3종.
 *
 * 모임 참여 신청 결과를 알리는 데 씁니다. 진행률 숫자 변화와 함께 뜨면
 * "방금 내 행동이 반영됐다"는 인식이 확실해집니다 (골든 패스 ⑤).
 */

type Toast = { id: number; kind: ToastKind; message: string };

const ICON: Record<ToastKind, string> = {
  success: "✓",
  error: "⚠",
  info: "ℹ",
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, kind, message }]);
    // 3초 후 자동 소멸. 사용자가 닫을 필요가 없어야 합니다.
    setTimeout(
      () => setToasts((prev) => prev.filter((toast) => toast.id !== id)),
      3000,
    );
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toasts.length > 0 && (
        <div className={styles.stack} role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`${styles.toast} ${toast.kind === "error" ? styles.error : ""}`}
            >
              <span className={styles.icon} aria-hidden>
                {ICON[toast.kind]}
              </span>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
