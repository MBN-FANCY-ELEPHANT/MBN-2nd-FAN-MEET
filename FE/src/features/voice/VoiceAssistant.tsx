import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { api, type ChatCitation } from "../../api/client";
import BottomSheet from "../../components/ui/BottomSheet";
import Icon from "../../components/ui/Icon";
import { currentLocale } from "../../i18n";
import { MASCOT } from "./mascot";
import styles from "./VoiceAssistant.module.css";
import { useSpeech } from "./useSpeech";
import { useSpeechRecognition } from "./useSpeechRecognition";

/**
 * AI 도우미 "비엔이" — 음성 오버레이.
 *
 * 디자인의 4단계 상태 머신입니다 (Figma 7:1432 → 7:1490 → 7:1548 → 7:1605):
 *
 *   LISTENING     "말씀해 주세요. 듣고 있습니다."   마이크 오렌지
 *   TRANSCRIBING  인식된 발화를 실시간 표시          마이크 오렌지
 *   THINKING      "검색 중..."                      마이크 회색(비활성)
 *   ANSWERED      인디고 카드에 답변 + 딥링크        마이크 오렌지(재질문)
 *
 * THINKING 에서 마이크를 비활성화하는 것은 연출이자 **중복 요청 차단**입니다.
 *
 * **음성 입출력은 전부 브라우저 내장 기능입니다** — 무료이고 키가 필요 없습니다
 * (docs/ai-stack.md §2~3):
 *   - 입력: Web Speech API (`SpeechRecognition`). 미지원·권한 거부 시 텍스트 입력으로 폴백
 *   - 출력: `speechSynthesis`. 실패해도 조용히 무시 (답변 텍스트는 이미 화면에 있음)
 */

type Phase = "LISTENING" | "TRANSCRIBING" | "THINKING" | "ANSWERED";

/** citation 타입 → 앱 내 라우트. 답변 근거를 탭하면 해당 화면으로 이동합니다. */
const CITATION_ROUTE: Record<string, (id: number) => string> = {
  SCHEDULE: () => "/home",
  CONTENT: (id) => `/contents/${id}`,
  GATHERING: (id) => `/community/gatherings/${id}`,
  PLACE: () => "/play",
  TIP: () => "/play",
};

export default function VoiceAssistant({
  starId,
  onClose,
}: {
  starId: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("LISTENING");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<ChatCitation[]>([]);
  const [typedQuestion, setTypedQuestion] = useState("");

  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // 스트리밍 중 누적된 텍스트. done 시점에 이걸 TTS 로 넘깁니다.
  const answerBufferRef = useRef("");

  const speech = useSpeech();

  const ask = useCallback(
    async (question: string) => {
      setPhase("THINKING");
      setAnswer("");
      setCitations([]);
      answerBufferRef.current = "";
      speech.stop();

      try {
        if (!sessionIdRef.current) {
          const session = await api.createChatSession(
            starId,
            currentLocale().toUpperCase(),
          );
          sessionIdRef.current = session.sessionId;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        await api.streamChatAnswer(
          sessionIdRef.current,
          question,
          {
            // 첫 delta 가 도착하는 순간 ANSWERED 로 전환해 타이핑처럼 보이게 합니다.
            onDelta: (text) => {
              answerBufferRef.current += text;
              setPhase("ANSWERED");
              setAnswer(answerBufferRef.current);
            },
            onCitations: setCitations,
            onDone: () => {
              setPhase("ANSWERED");
              speech.speak(answerBufferRef.current);
            },
            onError: (_code, message) => {
              setPhase("ANSWERED");
              setAnswer(message || t("toast.genericError"));
            },
          },
          controller.signal,
        );
      } catch {
        // 데모 중 무한 대기가 최악입니다. 실패해도 반드시 어떤 상태로든 빠져나옵니다.
        setPhase("ANSWERED");
        setAnswer(t("toast.genericError"));
      }
    },
    [starId, t, speech],
  );

  const recognition = useSpeechRecognition(ask);
  const {
    supported: liveSupported,
    listening,
    transcript,
    error,
    start,
    stop,
  } = recognition;

  // 음성 인식이 가능한지 → 불가하면 텍스트 입력으로 폴백
  const canUseMic =
    liveSupported && error !== "unsupported" && error !== "denied";

  useEffect(() => {
    if (canUseMic) start();
    return () => {
      stop();
      abortRef.current?.abort();
    };
  }, [canUseMic, start, stop]);

  useEffect(() => {
    if (listening && transcript) setPhase("TRANSCRIBING");
  }, [listening, transcript]);

  const micDisabled = phase === "THINKING";

  /** 재질문. 이전 답변 음성이 남아 있으면 끊고 다시 듣기 시작합니다. */
  const onMicTap = () => {
    if (micDisabled) return;
    speech.stop();
    setAnswer("");
    setCitations([]);
    setPhase("LISTENING");
    start();
  };

  // 디자인상 마스코트는 시트 위로 걸쳐 나옵니다. 이미지가 없으면 렌더하지 않습니다.
  const mascot = phase === "THINKING" ? MASCOT.thinking : MASCOT.listening;
  const showMascot = mascot !== null && phase !== "ANSWERED";

  return (
    <BottomSheet onClose={onClose} title={undefined} hideHandle overflowVisible>
      {showMascot && (
        <img className={styles.mascot} src={mascot} alt="" aria-hidden />
      )}
      <div className={styles.body}>
        <div className={styles.stage}>
          {phase === "LISTENING" && (
            <p className={styles.hint}>{t("chat.listening")}</p>
          )}

          {phase === "TRANSCRIBING" && (
            <p className={styles.transcript}>{transcript}</p>
          )}

          {phase === "THINKING" && (
            <p className={styles.hint}>{t("chat.thinking")}</p>
          )}

          {phase === "ANSWERED" && (
            <div className={styles.answer}>
              <p className={styles.answerText}>{answer}</p>

              {citations.length > 0 && (
                <div className={styles.citations}>
                  {citations.map((c) => (
                    <button
                      key={`${c.type}-${c.id}`}
                      className={styles.citation}
                      onClick={() => {
                        navigate(CITATION_ROUTE[c.type]?.(c.id) ?? "/");
                        onClose();
                      }}
                    >
                      <span className={styles.citationType}>{c.type}</span>
                      <span>{c.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!canUseMic ? (
          <>
            <p className={styles.notice}>
              {error === "denied"
                ? t("chat.micDenied")
                : t("chat.micUnsupported")}
            </p>
            <form
              className={styles.fallback}
              onSubmit={(e) => {
                e.preventDefault();
                const q = typedQuestion.trim();
                if (!q || micDisabled) return;
                setTypedQuestion("");
                void ask(q);
              }}
            >
              <input
                value={typedQuestion}
                onChange={(e) => setTypedQuestion(e.target.value)}
                placeholder={t("chat.placeholder")}
              />
              <button type="submit" disabled={micDisabled}>
                {t("chat.send")}
              </button>
            </form>
          </>
        ) : (
          <button
            className={`${styles.mic} ${micDisabled ? styles.micBusy : ""}`}
            onClick={onMicTap}
            disabled={micDisabled}
            aria-label={t("chat.title")}
          >
            <Icon name="mic" size={52} className={styles.micIcon} />
          </button>
        )}

        <p className={styles.notice}>{t("chat.disclaimer")}</p>
      </div>
    </BottomSheet>
  );
}
