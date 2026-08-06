import { useCallback, useEffect, useRef, useState } from "react";

import { LOCALE_BCP47, currentLocale } from "../../i18n";

/**
 * 답변 음성 재생 (TTS) — **브라우저 내장 `speechSynthesis`**.
 *
 * 무료이고 키가 필요 없으며 지연이 사실상 0 입니다. STT 로 Web Speech API 를 쓰는 것과
 * 같은 이유로 여기서도 브라우저 기능을 씁니다 (docs/ai-stack.md §3).
 *
 * **음성 선택이 품질을 좌우합니다.** Chrome 은 OS 기본 음성 외에 자체 고품질 음성
 * ("Google 한국어" 등)을 함께 제공하는데, 이쪽이 훨씬 자연스럽습니다.
 * 그래서 로케일이 맞는 음성 중 Google 계열을 우선 고릅니다.
 *
 * TTS 는 P1 이라 실패해도 조용히 무시합니다. 답변 텍스트는 이미 화면에 있으므로
 * 음성이 안 나온다고 시연이 멈추면 안 됩니다.
 */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // 음성 목록은 비동기로 채워집니다. 첫 호출에서 빈 배열이 오는 브라우저가 있어 이벤트도 구독합니다.
  useEffect(() => {
    if (!supported) return;

    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text.trim()) return;

      // 이전 발화가 남아 있으면 겹칩니다. 항상 비우고 시작합니다.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const lang = LOCALE_BCP47[currentLocale()];
      utterance.lang = lang;

      const prefix = lang.split("-")[0];
      const candidates = voices.filter((v) => v.lang.startsWith(prefix));
      // Google 계열이 OS 기본 음성보다 자연스럽습니다. 없으면 로케일 일치 음성 아무거나.
      utterance.voice =
        candidates.find((v) => v.name.includes("Google")) ??
        candidates[0] ??
        null;

      // 살짝 느리게 읽어야 안내 문구로 들립니다. 기본값(1.0)은 다소 빠릅니다.
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      utteranceRef.current = utterance;
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported, voices],
  );

  useEffect(() => stop, [stop]);

  return { supported, speaking, speak, stop };
}
