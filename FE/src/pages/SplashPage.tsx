import { useRef, useState } from "react";

import biniVideo from "../assets/mascot/bini.mp4";
import styles from "./SplashPage.module.css";

const CLIP_DURATION_SECONDS = 3;

export default function SplashPage({ onFinish }: { onFinish: () => void }) {
  const clipEndRef = useRef(CLIP_DURATION_SECONDS);
  const [ready, setReady] = useState(false);

  return (
    <div className={styles.page} aria-label="MBN AI" role="status">
      <video
        className={`${styles.video} ${ready ? styles.videoReady : ""}`}
        src={biniVideo}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          const clipDuration = Math.min(CLIP_DURATION_SECONDS, video.duration);
          const clipStart = Math.max(0, (video.duration - clipDuration) / 2);
          clipEndRef.current = clipStart + clipDuration;
          if (clipStart === 0) {
            setReady(true);
            void video.play();
          } else {
            video.currentTime = clipStart;
          }
        }}
        onSeeked={(event) => {
          setReady(true);
          void event.currentTarget.play();
        }}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= clipEndRef.current) onFinish();
        }}
        onEnded={onFinish}
        onError={onFinish}
        aria-hidden="true"
      />
      <span
        className={`${styles.logo} ${ready ? styles.logoReady : ""}`}
        aria-hidden="true"
      >
        매일가요
      </span>
    </div>
  );
}
