import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { api, type ChatCitation } from "../../api/client";
import BottomSheet from "../../components/ui/BottomSheet";
import Icon from "../../components/ui/Icon";
import { getSelectedArtist } from "../artist/selectedArtist";
import { currentLocale } from "../../i18n";
import { MASCOT } from "./mascot";
import styles from "./VoiceAssistant.module.css";
import {
  VoiceBurst,
  VoiceStageRail,
  type VoicePhase,
} from "./VoiceStages";
import { useSpeech } from "./useSpeech";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { matchVoiceCommand } from "./voiceCommands";

/**
 * AI 도우미 "비엔이" — 음성 오버레이.
 *
 * **5단계 상태 머신**입니다 (Figma 7:1432 → 7:1490 → 7:1548 → 7:1605 + 후속 단계):
 *
 *   LISTENING     "말씀해 주세요. 듣고 있습니다."   마이크 오렌지
 *   TRANSCRIBING  인식된 발화를 실시간 표시          마이크 오렌지
 *   THINKING      "검색 중..."                      마이크 회색(비활성)
 *   ANSWERED      인디고 카드에 답변 + 딥링크        마이크 오렌지(재질문)
 *   FOLLOW_UP     답변 낭독이 끝나 다음 지시 대기    마이크 오렌지 + 안내 강조
 *
 * THINKING 에서 마이크를 비활성화하는 것은 연출이자 **중복 요청 차단**입니다.
 *
 * 단계는 상단 레일(`VoiceStageRail`)로 항상 보이고, 마이크 뒤 주황 이펙트
 * (`VoiceBurst`)의 속도가 단계마다 달라집니다 — 화면을 안 읽어도 진행 중인지 알 수 있게.
 *
 * **음성 입출력은 전부 브라우저 내장 기능입니다** — 무료이고 키가 필요 없습니다
 * (docs/ai-stack.md §2~3):
 *   - 입력: Web Speech API (`SpeechRecognition`). 미지원·권한 거부 시 텍스트 입력으로 폴백
 *   - 출력: `speechSynthesis`. 실패해도 조용히 무시 (답변 텍스트는 이미 화면에 있음)
 */

type Phase = VoicePhase;

/**
 * citation 타입 → 앱 내 라우트. 답변 근거를 탭하면 해당 화면으로 이동합니다.
 *
 * ⚠️ 서버가 `route` 를 내려주면 **그쪽이 우선**입니다 (기능 안내 `FEATURE` 근거).
 *    이 표는 route 가 없는 DB 리소스 근거의 폴백이며, PLACE·TIP·SCHEDULE 은
 *    `EvidenceFinder` 가 route 를 안 채우므로 **항상 이 표를 탑니다.**
 *
 * ⚠️ 이 표는 실제 라우트와 어긋나기 쉽습니다 — 한때 PLACE 가 모집 탭으로, TIP 이 빈
 *    투표 탭으로 가고 있었습니다. 라우트를 바꾸면 여기도 같이 고치세요.
 */
const CITATION_ROUTE: Record<string, (id: number) => string> = {
  SCHEDULE: (id) => `/fanspace/concert/${id}`,
  CONTENT: (id) => `/videos/${id}`,
  GATHERING: (id) => `/community/gatherings/${id}`,
  PLACE: () => "/play/places",
  TIP: (id) => `/play/tips/${id}`,
};

/** citation 하나가 가리키는 화면. 서버가 준 route 를 최우선으로 씁니다. */
function citationRoute(citation: ChatCitation): string {
  if (citation.route) return citation.route;
  const build: ((id: number) => string) | undefined =
    CITATION_ROUTE[citation.type];
  return build !== undefined && citation.id != null
    ? build(citation.id)
    : "/home";
}

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
  // 내가 말한 것. THINKING·ANSWERED 에서도 계속 보여줍니다 — 중장년 사용자가
  // "내 말이 제대로 들어갔나"를 확인할 수 있어야 다음 발화를 이어갑니다.
  const [asked, setAsked] = useState("");
  // 답변 스트리밍이 끝났는지. 낭독까지 끝나면 FOLLOW_UP(다음 지시 대기)으로 넘어갑니다.
  const [answerDone, setAnswerDone] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // 스트리밍 중 누적된 텍스트. done 시점에 이걸 TTS 로 넘깁니다.
  const answerBufferRef = useRef("");
  // 직전 답변이 **기능 안내**였는지. 그랬다면 다음 발화는 "공연" 한 단어만으로도
  // 이동으로 봅니다 (도우미가 방금 기능 목록을 읽어줬으니 자연스러운 대답입니다).
  const afterFeatureAnswerRef = useRef(false);

  const speech = useSpeech();

  const ask = useCallback(
    async (question: string) => {
      setAsked(question);

      // 이동 명령이면 AI 왕복 없이 바로 화면을 넘깁니다 (features/voice/voiceCommands.ts).
      // 직전 답변이 기능 안내였다면 "공연" 한 단어만으로도 이동합니다.
      const command = matchVoiceCommand(
        question,
        afterFeatureAnswerRef.current,
      );
      if (command) {
        speech.stop();
        speech.speak(t("voice.moving", { target: t(command.labelKey) }));
        navigate(command.route);
        onClose();
        return;
      }

      setPhase("THINKING");
      setAnswer("");
      setAnswerDone(false);
      setCitations([]);
      answerBufferRef.current = "";
      afterFeatureAnswerRef.current = false;
      speech.stop();

      try {
        if (!sessionIdRef.current) {
          const session = await api.createChatSession(
            starId,
            currentLocale().toUpperCase(),
            getSelectedArtist() ?? undefined,
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
            onCitations: (list) => {
              setCitations(list);
              afterFeatureAnswerRef.current = list.some(
                (c) => c.type === "FEATURE",
              );
            },
            onDone: () => {
              setPhase("ANSWERED");
              setAnswerDone(true);
              speech.speak(answerBufferRef.current);
            },
            onError: (_code, message) => {
              setPhase("ANSWERED");
              setAnswerDone(true);
              setAnswer(message || t("toast.genericError"));
            },
          },
          controller.signal,
        );
      } catch {
        // 데모 중 무한 대기가 최악입니다. 실패해도 반드시 어떤 상태로든 빠져나옵니다.
        setPhase("ANSWERED");
        setAnswerDone(true);
        setAnswer(t("toast.genericError"));
      }
    },
    [starId, t, speech, navigate, onClose],
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

  // 5단계째 — 낭독까지 끝나면 "다음 지시"를 받을 준비가 된 상태입니다.
  // TTS 를 못 쓰는 브라우저면 `speaking` 이 계속 false 라 답변 직후 바로 넘어갑니다.
  useEffect(() => {
    if (phase === "ANSWERED" && answerDone && !speech.speaking) {
      setPhase("FOLLOW_UP");
    }
  }, [phase, answerDone, speech.speaking]);

  const micDisabled = phase === "THINKING";
  const showsAnswer = phase === "ANSWERED" || phase === "FOLLOW_UP";

  /** 재질문. 이전 답변 음성이 남아 있으면 끊고 다시 듣기 시작합니다. */
  const onMicTap = () => {
    if (micDisabled) return;
    speech.stop();
    setAnswer("");
    setAnswerDone(false);
    setCitations([]);
    setAsked("");
    setPhase("LISTENING");
    start();
  };

  // 디자인상 마스코트는 시트 위로 걸쳐 나옵니다. 이미지가 없으면 렌더하지 않습니다.
  const mascot = phase === "THINKING" ? MASCOT.thinking : MASCOT.listening;
  const showMascot = mascot !== null && !showsAnswer;

  return (
    <BottomSheet onClose={onClose} title={undefined} hideHandle overflowVisible>
      {showMascot && (
        <img className={styles.mascot} src={mascot} alt="" aria-hidden />
      )}
      <div className={styles.body}>
        {/* 5단계 진행 표시 — 지금 어디까지 왔는지 항상 보이게 합니다 */}
        <VoiceStageRail phase={phase} />

        <div className={styles.stage}>
          {phase === "LISTENING" && (
            <p className={styles.hint}>{t("chat.listening")}</p>
          )}

          {phase === "TRANSCRIBING" && (
            <p className={styles.transcript}>{transcript}</p>
          )}

          {/* 검색·답변 중에도 **내가 말한 문장**을 계속 띄웁니다.
              전에는 THINKING 으로 넘어가는 순간 사라져서 인식이 됐는지 알 수 없었습니다. */}
          {asked && (phase === "THINKING" || showsAnswer) && (
            <p className={styles.askedBubble}>{asked}</p>
          )}

          {phase === "THINKING" && (
            <p className={styles.hint}>{t("chat.thinking")}</p>
          )}

          {showsAnswer && (
            <div className={styles.answer}>
              <p className={styles.answerText}>{answer}</p>

              {citations.length > 0 && (
                <div className={styles.citations}>
                  {citations.map((c) => (
                    <button
                      key={`${c.type}-${c.id ?? c.title}`}
                      className={styles.citation}
                      onClick={() => {
                        navigate(citationRoute(c));
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
          <>
            {/* 답변 뒤에는 "다시 눌러 말하면 화면 이동까지 된다"를 알려줍니다.
                말로 조작할 수 있다는 걸 모르면 아무도 두 번째 발화를 하지 않습니다. */}
            {showsAnswer && (
              <p className={styles.followUp}>
                {phase === "FOLLOW_UP"
                  ? t("voice.followUpReady")
                  : t("voice.followUpHint")}
              </p>
            )}
            <div className={styles.micWrap}>
              <VoiceBurst phase={phase} />
              <button
                className={`${styles.mic} ${micDisabled ? styles.micBusy : ""}`}
                onClick={onMicTap}
                disabled={micDisabled}
                aria-label={t("chat.title")}
              >
                <Icon name="mic" size={52} className={styles.micIcon} />
              </button>
            </div>
          </>
        )}

        <p className={styles.notice}>{t("chat.disclaimer")}</p>
      </div>
    </BottomSheet>
  );
}
