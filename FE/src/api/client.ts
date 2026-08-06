import { LOCALE_BCP47, currentLocale } from "../i18n";
import type { paths } from "./schema";

/**
 * 타입 안전 API 클라이언트.
 *
 * `schema.d.ts` 는 `npm run api:types` 로 docs/api-spec.yaml 에서 생성됩니다.
 * ⚠️ 응답 타입을 손으로 정의하지 마세요. 계약이 바뀌면 스펙을 고치고 타입을 재생성합니다.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// tsconfig 의 erasableSyntaxOnly 때문에 생성자 파라미터 프로퍼티는 쓸 수 없습니다.
// 필드를 선언하고 생성자에서 대입하세요.
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

let accessToken: string | null = localStorage.getItem("trot.token");

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) localStorage.setItem("trot.token", token);
  else localStorage.removeItem("trot.token");
}

/**
 * 모든 요청에 현재 UI 언어를 실어 보냅니다.
 * 서버는 이 값으로 AI 분석·댓글 번역·챗봇 응답 언어를 결정하므로,
 * 언어 토글 하나로 UI 와 AI 응답이 함께 바뀝니다 (골든 패스 ⑥).
 */
function defaultHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Accept-Language": LOCALE_BCP47[currentLocale()],
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...defaultHeaders(),
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.code ?? "UNKNOWN",
      body?.message ?? `Request failed with ${res.status}`,
    );
  }

  return body as T;
}

/** 쿼리 파라미터에서 undefined/null 을 제거하고 문자열로 직렬화 */
function qs(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null,
  );
  return entries.length
    ? `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))}`
    : "";
}

// ─────────────────────────────── 타입 별칭 ───────────────────────────────
type Json<T> = T extends { content: { "application/json": infer R } }
  ? R
  : never;

export type HomeResponse = Json<
  paths["/api/v1/stars/{starId}/home"]["get"]["responses"]["200"]
>;
export type PlayResponse = Json<
  paths["/api/v1/stars/{starId}/play"]["get"]["responses"]["200"]
>;
export type Star = Json<
  paths["/api/v1/stars/{starId}"]["get"]["responses"]["200"]
>;
export type GatheringPage = Json<
  paths["/api/v1/gatherings"]["get"]["responses"]["200"]
>;
export type Gathering = Json<
  paths["/api/v1/gatherings/{id}"]["get"]["responses"]["200"]
>;
export type ContentPage = Json<
  paths["/api/v1/contents"]["get"]["responses"]["200"]
>;
export type Content = Json<
  paths["/api/v1/contents/{id}"]["get"]["responses"]["200"]
>;
export type ContentSummary = NonNullable<ContentPage["content"]>[number];
export type AiAnalysis = Json<
  paths["/api/v1/contents/{id}/ai-analysis"]["get"]["responses"]["200"]
>;
export type CommentPage = Json<
  paths["/api/v1/contents/{id}/comments"]["get"]["responses"]["200"]
>;
export type Comment = NonNullable<CommentPage["content"]>[number];
export type LikeState = Json<
  paths["/api/v1/contents/{id}/like"]["post"]["responses"]["200"]
>;
export type SubscriptionState = Json<
  paths["/api/v1/channels/{id}/subscription"]["post"]["responses"]["200"]
>;
export type User = Json<paths["/api/v1/users/me"]["get"]["responses"]["200"]>;
export type ChatMessage = Json<
  paths["/api/v1/chat/sessions/{sessionId}/messages"]["post"]["responses"]["200"]
>;
export type ChatCitation = { type: string; id: number; title: string };
export type AuthResponse = Json<
  paths["/api/v1/auth/login"]["post"]["responses"]["200"]
>;
export type PlacePage = Json<
  paths["/api/v1/places"]["get"]["responses"]["200"]
>;
export type TipPage = Json<paths["/api/v1/tips"]["get"]["responses"]["200"]>;
export type Tip = Json<paths["/api/v1/tips/{id}"]["get"]["responses"]["200"]>;
export type SchedulePage = Json<
  paths["/api/v1/schedules"]["get"]["responses"]["200"]
>;
export type SearchResponse = Json<
  paths["/api/v1/search"]["get"]["responses"]["200"]
>;
export type Place = NonNullable<PlayResponse["places"]>[number];
export type TipSummary = NonNullable<PlayResponse["tips"]>[number];

// ─────────────────────────────── 엔드포인트 ───────────────────────────────
export const api = {
  getHome: (starId: number) =>
    request<HomeResponse>(`/api/v1/stars/${starId}/home`),

  getStar: (starId: number) => request<Star>(`/api/v1/stars/${starId}`),

  getGatherings: (params: {
    starId: number;
    status?: string;
    page?: number;
    size?: number;
  }) => request<GatheringPage>(`/api/v1/gatherings${qs(params)}`),

  getGathering: (id: number) => request<Gathering>(`/api/v1/gatherings/${id}`),

  applyGathering: (id: number, note?: string) =>
    request(`/api/v1/gatherings/${id}/applications`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),

  cancelGatheringApplication: (id: number) =>
    request<void>(`/api/v1/gatherings/${id}/applications/me`, {
      method: "DELETE",
    }),

  getPlay: (starId: number) =>
    request<PlayResponse>(`/api/v1/stars/${starId}/play`),

  // ── 콘텐츠 (기사 · 영상) ──
  getContents: (params: {
    starId: number;
    type?: "ARTICLE" | "VIDEO";
    live?: boolean;
    page?: number;
    size?: number;
  }) => request<ContentPage>(`/api/v1/contents${qs(params)}`),

  getContent: (id: number) => request<Content>(`/api/v1/contents/${id}`),

  getRelatedContents: (id: number, limit?: number) =>
    request<ContentSummary[]>(`/api/v1/contents/${id}/related${qs({ limit })}`),

  getAiAnalysis: (id: number) =>
    request<AiAnalysis>(`/api/v1/contents/${id}/ai-analysis`),

  likeContent: (id: number) =>
    request<LikeState>(`/api/v1/contents/${id}/like`, { method: "POST" }),

  unlikeContent: (id: number) =>
    request<LikeState>(`/api/v1/contents/${id}/like`, { method: "DELETE" }),

  // ── 댓글 ──
  getComments: (contentId: number, params?: { page?: number; size?: number }) =>
    request<CommentPage>(
      `/api/v1/contents/${contentId}/comments${qs(params ?? {})}`,
    ),

  createComment: (contentId: number, body: string) =>
    request<Comment>(`/api/v1/contents/${contentId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),

  deleteComment: (id: number) =>
    request<void>(`/api/v1/comments/${id}`, { method: "DELETE" }),

  likeComment: (id: number) =>
    request<LikeState>(`/api/v1/comments/${id}/like`, { method: "POST" }),

  unlikeComment: (id: number) =>
    request<LikeState>(`/api/v1/comments/${id}/like`, { method: "DELETE" }),

  translateComment: (id: number) =>
    request<{ commentId: number; locale: string; translatedBody: string }>(
      `/api/v1/comments/${id}/translation`,
    ),

  // ── 구독 ──
  subscribeChannel: (id: number) =>
    request<SubscriptionState>(`/api/v1/channels/${id}/subscription`, {
      method: "POST",
    }),

  unsubscribeChannel: (id: number) =>
    request<SubscriptionState>(`/api/v1/channels/${id}/subscription`, {
      method: "DELETE",
    }),

  // ── 간이 인증 ──
  getDemoUsers: () => request<User[]>("/api/v1/auth/demo-users"),

  login: (userId: number) =>
    request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  getMe: () => request<User>("/api/v1/users/me"),

  // ── AI 도우미 "비엔이" ──
  createChatSession: (starId: number, locale: string) =>
    request<{ sessionId: string; suggestedQuestions: string[] }>(
      "/api/v1/chat/sessions",
      {
        method: "POST",
        body: JSON.stringify({ starId, locale }),
      },
    ),

  /**
   * 답변을 SSE 로 구독합니다.
   *
   * `EventSource` 는 POST 를 지원하지 않아 `fetch` + `ReadableStream` 으로 직접 파싱합니다.
   * `delta` 이벤트를 누적 렌더하면 타이핑 효과가 나옵니다 — 데모 임팩트의 상당 부분이 여기서 나옵니다.
   */
  streamChatAnswer: async (
    sessionId: string,
    content: string,
    handlers: {
      onDelta: (text: string) => void;
      onCitations: (citations: ChatCitation[]) => void;
      onDone: (messageId: number) => void;
      onError: (code: string, message: string) => void;
    },
    signal?: AbortSignal,
  ) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: { ...defaultHeaders(), Accept: "text/event-stream" },
        body: JSON.stringify({ content }),
        signal,
      },
    );

    if (!res.ok || !res.body) {
      const body = await res.json().catch(() => null);
      handlers.onError(
        body?.code ?? "UNKNOWN",
        body?.message ?? `Request failed with ${res.status}`,
      );
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let eventName = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // 마지막 조각은 아직 완성되지 않았을 수 있으므로 버퍼에 남깁니다.
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const payload = JSON.parse(line.slice(5).trim());
          if (eventName === "delta") handlers.onDelta(payload.text);
          else if (eventName === "citations")
            handlers.onCitations(payload.citations);
          else if (eventName === "done") handlers.onDone(payload.messageId);
          else if (eventName === "error")
            handlers.onError(payload.code, payload.message);
        }
      }
    }
  },

  // 음성 입출력(STT/TTS)에는 서버 API 가 없습니다.
  // 브라우저 내장 Web Speech API 를 씁니다 — 무료이고 키가 필요 없습니다.
  // 입력: src/features/voice/useSpeechRecognition.ts
  // 출력: src/features/voice/useSpeech.ts

  getSchedules: (params: {
    starId: number;
    upcoming?: boolean;
    type?: string;
    page?: number;
    size?: number;
  }) => request<SchedulePage>(`/api/v1/schedules${qs(params)}`),

  search: (params: { starId: number; q: string; limitPerCategory?: number }) =>
    request<SearchResponse>(`/api/v1/search${qs(params)}`),

  getTip: (id: number) => request<Tip>(`/api/v1/tips/${id}`),

  // ── PLAY ──
  getPlaces: (params: { starId: number; page?: number; size?: number }) =>
    request<PlacePage>(`/api/v1/places${qs(params)}`),

  getTips: (params: {
    starId: number;
    category?: string;
    page?: number;
    size?: number;
  }) => request<TipPage>(`/api/v1/tips${qs(params)}`),
};
