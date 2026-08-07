import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App";
import ToastProvider from "./components/ui/ToastProvider";
import "./i18n";
import "./styles/global.css";

/**
 * 이미지 로드 실패를 전역에서 예시 이미지로 폴백합니다.
 *
 * ⚠️ `public/artists/<slug>/` 의 사진은 **아직 채워지는 중**이라 없는 파일이 섞입니다.
 *    없으면 브라우저가 깨진 이미지 아이콘을 그리는데, 시연 화면에서 가장 눈에 띄는 사고입니다.
 *
 * `error` 는 버블링하지 않으므로 **캡처 단계**로 듣습니다. `<img>` 마다 `onError` 를 다는
 * 것보다 낫습니다 — 이미지를 그리는 컴포넌트가 20곳 가까이 되고, 새로 추가되는 곳까지
 * 자동으로 덮이기 때문입니다.
 *
 * `dataset.fallback` 단계 플래그로 같은 이미지를 두 번까지만 바꿉니다.
 * 표시하지 않으면 폴백 이미지가 실패했을 때 무한 루프가 됩니다.
 *
 * ⚠️ **YouTube 썸네일은 한 단계를 더 둡니다.** `maxresdefault.jpg` 는 업로더가 HD 로
 *    올린 영상에만 있고 아니면 404 입니다. 이때 예시 이미지로 바로 떨어뜨리지 않고
 *    **항상 존재하는 `hqdefault.jpg`** 로 한 번 더 시도합니다.
 */
const FALLBACK_IMAGE = "/example_thumb.png";

document.addEventListener(
  "error",
  (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;

    const stage = target.dataset.fallback;
    if (stage === "done") return;

    if (!stage && target.src.includes("/maxresdefault.jpg")) {
      target.dataset.fallback = "yt";
      target.src = target.src.replace("/maxresdefault.jpg", "/hqdefault.jpg");
      return;
    }

    target.dataset.fallback = "done";
    target.src = FALLBACK_IMAGE;
  },
  true,
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
