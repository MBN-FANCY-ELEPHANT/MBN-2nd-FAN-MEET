package kr.co.mbn.trot.ai.provider.openai;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import kr.co.mbn.trot.ai.provider.AiAnalysisRequest;
import kr.co.mbn.trot.ai.provider.AiAnalysisResult;
import kr.co.mbn.trot.ai.provider.AiProvider;
import kr.co.mbn.trot.ai.provider.ChatAnswer;
import kr.co.mbn.trot.ai.provider.ChatQuestion;
import kr.co.mbn.trot.ai.provider.Evidence;
import kr.co.mbn.trot.ai.provider.StubAiProvider;
import kr.co.mbn.trot.user.domain.Locale;

/**
 * 실제 LLM 구현 (OpenAI, gpt-4o-mini).
 *
 * <p><b>이 클래스는 얇습니다.</b> 근거 검색·스코프 판정·citations 구성·SSE·캐싱은 전부
 * 이 클래스 바깥에서 이미 끝나 있습니다. 여기서는 "받은 근거로 문장을 만드는 일"만 합니다.
 *
 * <p><b>비용 통제</b> (예산 5~10달러 기준):
 * <ul>
 *   <li>스코프 밖 질문은 <b>호출조차 하지 않습니다</b> — {@code inScope=false} 면 즉시 거절 문구</li>
 *   <li>근거가 없으면 호출하지 않습니다 — 지어낼 재료가 없으니 물어볼 이유도 없습니다</li>
 *   <li>{@link AiUsageGuard} 일일 상한 초과 시 스텁으로 폴백 (예외를 던지지 않습니다)</li>
 *   <li>분석·번역 결과는 DB 에 캐싱되므로 콘텐츠당 1회만 호출됩니다</li>
 *   <li>{@code max_tokens} 를 400 으로 제한 — 음성 답변은 짧아야 듣기도 좋습니다</li>
 * </ul>
 */
@Component
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "openai")
public class OpenAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiProvider.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /**
     * 페르소나 + 정책. 매 호출 반복되는 고정 접두사이므로 프롬프트 캐싱이 걸립니다.
     * <b>여기 있는 정책은 기획서에서 온 것이며 협상 대상이 아닙니다.</b>
     */
    private static final String SYSTEM_PROMPT = """
            당신은 MBN 방송사의 공식 AI 도우미 "비엔이"입니다.

            [정체성]
            - 당신은 AI 도우미이며, 트롯 가수 본인이 아닙니다. 스타를 사칭하지 마세요.
            - 팬을 친근하게 대하되 과장하지 않습니다.

            [답변 범위]
            - MBN 방송, 트롯 아티스트, 그리고 아래 제공되는 플랫폼 데이터에 대해서만 답합니다.
            - 범위 밖 주제(날씨, 주식, 코딩, 정치, 의료 등)는 답하지 않습니다.
            - **이 앱의 기능·사용법에 대한 질문은 반드시 답합니다.** 모른다고 하지 마세요.

            [이 서비스]
            - 이 앱은 MBN 트롯 팬덤 앱입니다. 팬이 아티스트를 고르면 그 아티스트 전용 공간이 열립니다.
            - 아래 [응원 아티스트] 가 주어지면 **그 아티스트에 대한 질문으로 받아들이세요.**
              "우리 오빠", "그 사람" 같은 표현도 그 아티스트를 가리킵니다.
              [근거] 의 일정·모임·콘텐츠는 **그 아티스트의 것**입니다. 다른 이름이라고
              말하거나 "정보가 없다"고 하지 마세요.
            - 기능을 묻는 질문에는 [근거] 의 기능 목록에서 **질문 상황에 맞는 2~3개만** 골라
              안내하세요. 일곱 개를 전부 나열하지 마세요.
            - "무엇을 하고 싶다"는 요청에는 **어느 화면에서 하는지 화면 이름을 반드시 말하세요**
              (예: "공연 응모는 공연 화면에서 하실 수 있어요").
            - ⚠️ 사용자가 요청한 기능이 [근거] 기능 목록에 **있으면 절대 "없다"고 하지 마세요.**
              목록의 맨 앞 기능이 보통 요청한 기능입니다. 그 기능부터 안내하세요.
            - 주 사용자층이 중장년입니다. 짧고 쉬운 말로, 전문 용어 없이 답하세요.

            [사실 원칙 — 가장 중요]
            - 아래 [근거] 에 없는 사실은 절대 지어내지 마세요.
            - 날짜, 장소, 인원 같은 수치는 [근거] 에 적힌 값을 그대로 쓰세요.
            - [근거] 로 답할 수 없으면 모른다고 답하세요.

            [형식]
            - 2~3문장으로 짧게 답합니다. 음성으로 읽히기 때문입니다.
            - 기능을 안내한 뒤에는 "말씀하시면 바로 열어드릴게요" 처럼
              **다음 발화를 유도하는 한마디**를 붙이세요.
            - 목록이나 마크다운을 쓰지 말고 자연스러운 문장으로 답하세요.
            - 사용자의 언어로 답하세요.
            """;

    private final OpenAiClient client;
    private final AiUsageGuard guard;
    /** 상한 초과·근거 없음 등 호출하지 않는 경로에서 재사용합니다. */
    private final StubAiProvider fallback = new StubAiProvider();

    public OpenAiProvider(OpenAiClient client, AiUsageGuard guard) {
        this.client = client;
        this.guard = guard;
    }

    @Override
    public boolean isLive() {
        return true;
    }

    // ─────────────────────────── 대화 ───────────────────────────

    @Override
    public ChatAnswer answer(ChatQuestion question) {
        // 스코프 밖이면 LLM 을 호출하지 않습니다 — 비용도 지연도 0.
        if (!question.inScope()) {
            return fallback.answer(question);
        }
        // 근거가 없으면 지어낼 재료가 없으므로 호출하지 않습니다.
        if (question.evidence().isEmpty()) {
            return fallback.answer(question);
        }
        if (!guard.tryAcquire()) {
            return fallback.answer(question);
        }

        List<Evidence> citations = question.evidence().stream().limit(3).toList();

        try {
            String text = client.chat(SYSTEM_PROMPT, buildUserPrompt(question, citations), false);
            return new ChatAnswer(text.trim(), citations, false);
        } catch (RuntimeException e) {
            // 시연 중 화면이 죽는 것보다 템플릿 답변이 낫습니다.
            log.warn("OpenAI 답변 실패 — 스텁으로 폴백: {}", e.getMessage());
            return fallback.answer(question);
        }
    }

    private static String buildUserPrompt(ChatQuestion question, List<Evidence> citations) {
        StringBuilder sb = new StringBuilder();
        // 언어 지시를 목표 언어로, 맨 앞에 둡니다 (analyze 와 같은 이유).
        sb.append(languageDirective(question.locale())).append('\n');
        sb.append("[INTENT] ").append(question.intent().name()).append('\n');
        sb.append("[EVIDENCE]\n");
        for (Evidence e : citations) {
            sb.append("- (").append(e.type().name()).append(") ")
                    .append(e.title()).append(" — ").append(e.detail()).append('\n');
        }
        sb.append("\n[QUESTION]\n").append(question.text());
        return sb.toString();
    }

    // ─────────────────────────── 분석 ───────────────────────────

    @Override
    public AiAnalysisResult analyze(AiAnalysisRequest request) {
        if (!guard.tryAcquire()) {
            return fallback.analyze(request);
        }

        // ⚠️ 언어 지시를 **목표 언어로, 맨 앞에** 둡니다.
        //    한국어로만 "지정된 언어로 작성하세요"라고 쓰면 모델이 한국어로 답해버립니다
        //    (실제로 겪은 버그 — EN 요청에 한국어 분석이 나왔습니다).
        String system = """
                %s

                You are MBN's content analysis AI. Analyze the given article or broadcast
                concisely, from a fan's perspective.

                Respond ONLY with this JSON shape:
                {"summary": "one-sentence summary", "items": [{"title": "label", "body": "analysis"}]}

                - 2 to 3 items.
                - `title` is a short label (under 8 characters in Korean, under 3 words in English).
                - `body` is 1-2 sentences.
                - Never invent facts that are not in the source text.
                """.formatted(languageDirective(request.locale()));

        String user = """
                [TYPE] %s
                [TITLE] %s
                [BODY]
                %s
                """.formatted(
                describeKind(request.kind()),
                request.title(),
                request.body() == null ? "(no body — analyze from the title alone)"
                        : truncate(request.body(), 3000));

        try {
            JsonNode json = MAPPER.readTree(client.chat(system, user, true));

            String summary = json.path("summary").asString("");
            List<AiAnalysisResult.Item> items = new ArrayList<>();
            for (JsonNode item : json.path("items")) {
                String title = item.path("title").asString("");
                String body = item.path("body").asString("");
                if (!title.isBlank() && !body.isBlank()) {
                    items.add(new AiAnalysisResult.Item(title, body));
                }
            }

            if (summary.isBlank() || items.isEmpty()) {
                return fallback.analyze(request);
            }
            return new AiAnalysisResult(summary, items);

        } catch (RuntimeException e) {
            log.warn("OpenAI 분석 실패 — 스텁으로 폴백: {}", e.getMessage());
            return fallback.analyze(request);
        }
    }

    /**
     * 분석 대상이 무엇인지 모델에게 한 줄로 알려줍니다.
     *
     * <p>{@code NEWS_DIGEST} 는 콘텐츠 <b>여러 건을 묶은</b> 소식 모아보기입니다.
     * 이걸 "video" 라고 알려주면 모델이 한 편의 영상인 줄 알고 요약이 어긋납니다.
     */
    private static String describeKind(String kind) {
        return switch (kind == null ? "" : kind) {
            case "ARTICLE" -> "news article";
            case "NEWS_DIGEST" ->
                    "a roundup of several recent MBN articles and videos about one trot artist "
                            + "— summarize what happened overall, not each item";
            default -> "video";
        };
    }

    /** 본문이 길면 앞부분만 보냅니다. 기사 도입부에 핵심이 있고, 입력 비용도 줄어듭니다. */
    private static String truncate(String text, int maxChars) {
        return text.length() <= maxChars ? text : text.substring(0, maxChars);
    }

    // ─────────────────────────── 번역 ───────────────────────────

    @Override
    public String translate(String text, Locale targetLocale) {
        if (!guard.tryAcquire()) {
            return fallback.translate(text, targetLocale); // 503 을 던집니다
        }

        String system = """
                당신은 번역기입니다. 입력된 문장을 지정된 언어로 자연스럽게 번역하세요.
                번역문만 출력하고 설명이나 따옴표를 덧붙이지 마세요.
                팬 커뮤니티 댓글이므로 구어체와 감탄사를 살려서 번역하세요.
                """;

        return client.chat(system, "%s\n[TARGET] %s\n[SOURCE]\n%s"
                .formatted(languageDirective(targetLocale), localeName(targetLocale), text),
                false).trim();
    }

    private static String localeName(Locale locale) {
        return switch (locale) {
            case KO -> "한국어";
            case EN -> "English";
            case JA -> "日本語";
            case FR -> "Français";
            case ES -> "Español";
            case ZH -> "简体中文";
            case RU -> "Русский";
        };
    }

    /**
     * 언어 지시문. <b>목표 언어로 직접 씁니다.</b>
     *
     * <p>한국어 프롬프트에 "English 로 답하세요"라고 적으면 모델이 한국어로 답하는 경우가
     * 있습니다. 지시를 해당 언어로 쓰면 훨씬 확실하게 따릅니다.
     */
    private static String languageDirective(Locale locale) {
        return switch (locale) {
            case KO -> "반드시 한국어로만 답하세요.";
            case EN -> "You MUST write your entire response in English.";
            case JA -> "必ず日本語だけで回答してください。";
            case FR -> "Vous DEVEZ répondre entièrement en français.";
            case ES -> "DEBES responder completamente en español.";
            case ZH -> "你必须完全用简体中文回答。";
            case RU -> "Вы ДОЛЖНЫ отвечать полностью на русском языке.";
        };
    }
}
