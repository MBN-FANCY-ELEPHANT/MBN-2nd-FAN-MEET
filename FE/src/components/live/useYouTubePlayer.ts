import { useEffect, useRef, useState } from "react";

/**
 * YouTube IFrame Player API 로 **실제 재생 시작 시점**을 알아냅니다.
 *
 * <b>왜 타이머로는 안 되는가:</b> 처음에는 "몇 초 뒤에 재생되겠지" 하고 포스터를 걷었는데,
 * 버퍼링이 그보다 길면 **검은 화면과 스피너가 그대로 노출**됐습니다 (실제로 겪음).
 * 재생 시작은 네트워크에 따라 달라지므로 추측하면 안 되고 이벤트로 받아야 합니다.
 *
 * ⚠️ API 키가 필요 없습니다. IFrame Player API 는 공개 스크립트이고,
 *    키가 필요한 건 메타데이터를 조회하는 Data API v3 인데 쓰지 않습니다.
 */

type YtPlayer = {
  destroy: () => void;
  mute: () => void;
  playVideo: () => void;
};
type YtNamespace = {
  Player: new (
    el: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: (e: { target: YtPlayer }) => void;
        onStateChange: (e: { data: number }) => void;
      };
    },
  ) => YtPlayer;
  PlayerState: { PLAYING: number };
};
/** 재생이 끊겼을 때 포스터를 다시 덮기까지의 유예. 짧은 버퍼링에 깜빡이지 않게 합니다. */
const RECOVER_MS = 600;
type WindowWithYt = Window & {
  YT?: YtNamespace;
  onYouTubeIframeAPIReady?: () => void;
};

const SCRIPT_SRC = "https://www.youtube.com/iframe_api";

/** 스크립트를 한 번만 싣고, 준비되면 resolve 합니다. */
function loadApi(): Promise<YtNamespace> {
  const w = window as WindowWithYt;
  if (w.YT?.Player) return Promise.resolve(w.YT);

  return new Promise((resolve) => {
    // 여러 배너가 동시에 붙어도 스크립트는 하나만 싣습니다.
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      document.head.appendChild(script);
    }
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (w.YT) resolve(w.YT);
    };
    // 이미 준비된 뒤에 훅이 붙는 경우를 위한 폴링 (콜백은 한 번만 호출됩니다)
    const timer = window.setInterval(() => {
      if (w.YT?.Player) {
        window.clearInterval(timer);
        resolve(w.YT);
      }
    }, 120);
  });
}

/**
 * @param videoId 재생할 YouTube 영상 ID
 * @returns `mountRef` 를 빈 div 에 걸면 그 자리에 플레이어가 생기고,
 *          `playing` 은 실제로 재생이 시작된 뒤 true 가 됩니다.
 */
export function useYouTubePlayer(videoId: string) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let player: YtPlayer | null = null;
    let cancelled = false;
    let recover = 0;

    if (!videoId) return;

    void loadApi().then((YT) => {
      if (cancelled || !mountRef.current) return;
      // ⚠️ `YT.Player` 는 넘긴 엘리먼트를 **iframe 으로 치환**합니다.
      //    mountRef 를 그대로 주면 클래스가 붙은 div 가 사라져 스타일이 통째로 날아가므로
      //    안에 버릴 div 를 하나 만들어 그걸 제물로 줍니다.
      const slot = document.createElement("div");
      mountRef.current.replaceChildren(slot);
      player = new YT.Player(slot, {
        videoId,
        playerVars: {
          autoplay: 1,
          // mute 없이는 자동재생이 브라우저 정책에 막힙니다.
          mute: 1,
          loop: 1,
          playlist: videoId,
          controls: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          // `autoplay=1` 만으로는 시작하지 않는 브라우저가 있어 준비되면 직접 재생시킵니다.
          // (mute 를 한 번 더 부르는 건 자동재생 차단을 확실히 피하기 위한 것입니다.)
          onReady: (e) => {
            e.target.mute();
            e.target.playVideo();
          },
          // ⚠️ **재생 중일 때만** 포스터를 걷습니다.
          //    일시정지·버퍼링 상태에서는 YouTube 가 화면 한가운데에 큼직한
          //    재생/이전/다음 버튼을 띄우는데, iframe 안이라 CSS 로 못 지웁니다.
          //    그래서 그 순간에는 포스터로 다시 덮어버립니다.
          onStateChange: (e) => {
            window.clearTimeout(recover);
            if (e.data === YT.PlayerState.PLAYING) {
              setPlaying(true);
              return;
            }
            recover = window.setTimeout(() => setPlaying(false), RECOVER_MS);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(recover);
      player?.destroy();
    };
  }, [videoId]);

  return { mountRef, playing };
}
