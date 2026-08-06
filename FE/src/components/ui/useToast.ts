import { createContext, useContext } from "react";

/**
 * Toast 컨텍스트.
 *
 * `ToastProvider.tsx` 와 분리한 이유: 컴포넌트 파일이 훅·상수를 함께 export 하면
 * Vite Fast Refresh 가 동작하지 않습니다.
 */
export type ToastKind = "success" | "error" | "info";

export const ToastContext = createContext<
  (kind: ToastKind, message: string) => void
>(() => {});

export function useToast() {
  return useContext(ToastContext);
}
