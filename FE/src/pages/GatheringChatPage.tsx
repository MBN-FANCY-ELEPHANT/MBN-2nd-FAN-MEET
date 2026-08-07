import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client";
import { STAR_ID } from "../app/constants";
import HeaderBack from "../components/layout/HeaderBack";
import Icon from "../components/ui/Icon";
import { ErrorState, LoadingState } from "../components/ui/States";
import { sampleChat } from "../data/gatheringChat";
import { getSelectedArtist } from "../features/artist/selectedArtist";
import { getFanIdentity } from "../features/auth/fanIdentity";
import { actionMessageKey } from "../features/voice/actionMessage";
import { currentLocale } from "../i18n";
import { formatDate } from "../lib/format";
import styles from "./GatheringChatPage.module.css";

/**
 * 참여 중인 모집의 **단체 대화방**.
 *
 * ⚠️ **실시간 채팅이 아닙니다.** 폴링도 소켓도 없습니다 — `docs/mvp-scope.md` 에서 실시간
 *    채팅은 컷됐고, 개편 결정 로그가 "모집 채팅은 **AI 단독 응답**, 채팅의 형식만 보여준다"
 *    로 확정했습니다. 그래서:
 *      - 다른 참여자 말풍선은 **정적 예시**입니다 (`data/gatheringChat.ts`)
 *      - 실제로 답하는 것은 **AI 도우미 비엔이** 하나뿐이고, 답변마다 AI 표기를 답니다
 *      - 화면 상단에 예시 대화라는 고지를 **반드시 남깁니다**
 *    이 고지를 빼면 다른 팬이 실제로 쓴 말처럼 보입니다.
 *
 * ⚠️ **신청하지 않았으면 들어올 수 없습니다.** 섹션에서는 신청한 모집만 링크하지만
 *    주소를 직접 열 수 있으므로 여기서도 막습니다.
 */
type Bubble =
  | { kind: "SAMPLE"; id: string; nickname: string; at: string; body: string }
  | { kind: "ME"; id: string; body: string }
  | { kind: "AI"; id: string; body: string };

export default function GatheringChatPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const gatheringId = Number(id);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["gathering", gatheringId],
    queryFn: () => api.getGathering(gatheringId),
    enabled: Number.isFinite(gatheringId),
  });

  const [sent, setSent] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 말풍선이 붙으면 아래로 따라갑니다. 안 하면 답이 화면 밖에 생깁니다.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [sent, thinking]);

  if (isPending) {
    return (
      <div className={styles.page}>
        <HeaderBack />
        <LoadingState />
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.page}>
        <HeaderBack />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  const applied = data.myApplication?.status === "APPLIED";
  const nickname = getFanIdentity()?.nickname ?? t("gatheringChat.me");

  async function send() {
    const question = draft.trim();
    if (!question || thinking) return;

    setDraft("");
    setSent((prev) => [
      ...prev,
      { kind: "ME", id: `me-${prev.length}`, body: question },
    ]);
    setThinking(true);

    let answer = "";
    const push = (body: string) =>
      setSent((prev) => [...prev, { kind: "AI", id: `ai-${prev.length}`, body }]);

    try {
      if (!sessionIdRef.current) {
        // ⚠️ `gatheringId` 를 넘겨야 이 방의 집결지·행사일·참가비가 근거로 들어갑니다.
        //    빠뜨리면 "집결지 어디예요?" 에 "정보를 제공할 수 없습니다" 가 나갑니다.
        const session = await api.createChatSession(
          STAR_ID,
          currentLocale().toUpperCase(),
          getSelectedArtist() ?? undefined,
          gatheringId,
        );
        sessionIdRef.current = session.sessionId;
      }

      await api.streamChatAnswer(sessionIdRef.current, question, {
        onDelta: (text) => {
          answer += text;
        },
        onCitations: () => {},
        // 대화방에서도 "신청 취소해줘" 같은 요청이 실제로 실행됩니다.
        // 문구는 음성 오버레이와 **같은 키**를 씁니다 (features/voice/actionMessage.ts).
        onAction: (action) => {
          answer = t(actionMessageKey(action), {
            title: action.targetTitle ?? "",
          });
        },
        onDone: () => {
          push(answer || t("toast.genericError"));
        },
        onError: (_code, message) => {
          push(message || t("toast.genericError"));
        },
      });
    } catch {
      // 데모 중 입력이 먹통이 되는 것이 최악입니다. 실패해도 반드시 답을 하나 붙입니다.
      push(t("toast.genericError"));
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className={styles.page}>
      <HeaderBack title={data.title} />

      {/* 모임 요약 — 대화 중에 집결지·일시를 다시 찾아 나가지 않도록 위에 고정합니다 */}
      <section className={styles.summary}>
        <p className={styles.summaryRow}>
          <Icon name="calendar" size={18} />
          <span>{formatDate(data.eventAt)}</span>
        </p>
        <p className={styles.summaryRow}>
          <Icon name="mapMarker" size={18} />
          <span>{data.meetingPoint}</span>
        </p>
        <p className={styles.summaryRow}>
          <Icon name="chatBubble" size={18} />
          <span>
            {t("gathering.progress", {
              current: data.currentCount,
              capacity: data.capacity,
            })}
          </span>
        </p>
      </section>

      {!applied ? (
        <div className={styles.locked}>
          <p className={styles.lockedText}>{t("gatheringChat.notApplied")}</p>
          <Link
            className={styles.lockedLink}
            to={`/community/gatherings/${gatheringId}`}
          >
            {t("gatheringChat.goApply")}
          </Link>
        </div>
      ) : (
        <>
          {/* ⚠️ 정책상 필수 고지 — 예시 대화이고 답하는 것은 AI 라는 사실 */}
          <p className={styles.notice}>{t("gatheringChat.sampleNotice")}</p>

          <div className={styles.thread}>
            {sampleChat(data.type).map((m) => (
              <div key={`s-${m.id}`} className={styles.otherRow}>
                <span className={styles.avatar} aria-hidden>
                  {m.nickname.slice(0, 1)}
                </span>
                <div>
                  <p className={styles.otherName}>
                    {m.nickname}
                    <span className={styles.time}>{m.at}</span>
                  </p>
                  <p className={styles.otherBubble}>{m.body}</p>
                </div>
              </div>
            ))}

            {sent.map((m) =>
              m.kind === "ME" ? (
                <div key={m.id} className={styles.meRow}>
                  <p className={styles.meBubble}>{m.body}</p>
                </div>
              ) : (
                <div key={m.id} className={styles.aiRow}>
                  <span className={styles.aiBadge}>
                    {t("gatheringChat.aiBadge")}
                  </span>
                  <p className={styles.aiBubble}>{m.body}</p>
                </div>
              ),
            )}

            {thinking && (
              <div className={styles.aiRow}>
                <span className={styles.aiBadge}>
                  {t("gatheringChat.aiBadge")}
                </span>
                <p className={styles.aiBubble}>{t("chat.thinking")}</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className={styles.composer}
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("gatheringChat.placeholder", { nickname })}
              aria-label={t("gatheringChat.placeholder", { nickname })}
            />
            <button type="submit" disabled={thinking || !draft.trim()}>
              {t("chat.send")}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
