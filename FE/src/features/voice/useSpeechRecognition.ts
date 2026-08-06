import { useCallback, useEffect, useRef, useState } from "react";

import { LOCALE_BCP47, currentLocale } from "../../i18n";

/**
 * 브라우저 음성 인식 (Web Speech API).
 *
 * **왜 서버 STT 가 아니라 브라우저인가:** 디자인 화면 7:1490("말하는 중")은 사용자가 말하는
 * *도중에* 발화가 실시간으로 쌓이는 연출입니다. 이는 중간 결과(interim result) 없이는 만들 수
 * 없고, Whisper 계열은 녹음이 끝나야 텍스트가 나오므로 그 화면이 빈 채로 멈춥니다.
 * (docs/ai-stack.md §2)
 *
 * **폴백이 필수입니다.** 미지원 브라우저(Firefox)나 마이크 권한 거부 시 `supported`/`error`
 * 로 알리고, 호출부는 텍스트 입력으로 전환해야 합니다. 이게 없으면 시연이 멈춥니다.
 */

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type WindowWithSpeech = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as WindowWithSpeech;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export type SpeechError = "unsupported" | "denied" | "failed";

export function useSpeechRecognition(onFinal: (text: string) => void) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<SpeechError | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // 콜백을 ref 로 들고 있어야 매 렌더마다 인식기를 재생성하지 않습니다.
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const supported = getRecognitionCtor() !== undefined;

  const stop = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("unsupported");
      return;
    }

    setError(null);
    setTranscript("");

    const recognition = new Ctor();
    recognition.lang = LOCALE_BCP47[currentLocale()];
    recognition.interimResults = true; // ← "말하는 중" 화면의 핵심
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let text = "";
      let isFinal = false;
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        text += result[0].transcript;
        if (result.isFinal) isFinal = true;
      }
      setTranscript(text);
      if (isFinal && text.trim()) {
        onFinalRef.current(text.trim());
      }
    };

    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "denied"
          : "failed",
      );
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    supported,
    listening,
    transcript,
    error,
    start,
    stop,
    setTranscript,
  };
}
