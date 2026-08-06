package kr.co.mbn.trot.ai.provider;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.user.domain.Locale;

/**
 * LLM 없이 동작하는 기본 구현.
 *
 * <p><b>목적:</b> API 키가 준비되기 전에도 골든 패스 전체(근거 검색 → 답변 → 딥링크 → 언어 전환)를
 * 실제로 시연하고 검증할 수 있게 합니다. 답변 문장은 템플릿이지만 <b>근거 데이터는 실제 DB</b>에서
 * 온 것이라, 없는 사실을 지어내지 않습니다.
 *
 * <p><b>한계 (정직하게 기록):</b>
 * <ul>
 *   <li>자유로운 문장 생성이 아니라 의도별 템플릿입니다.</li>
 *   <li>번역은 흉내 낼 수 없어 {@link #translate} 는 503 을 던집니다.
 *       시드된 댓글은 {@code comment_translation} 에 미리 채워져 있어 캐시로 처리됩니다.</li>
 *   <li>KO/EN 만 문안이 있고 나머지 언어는 EN 으로 폴백합니다.</li>
 * </ul>
 *
 * <p>{@code app.ai.provider=openai} 로 바꾸면 이 빈이 비활성화됩니다.
 */
@Component
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "stub", matchIfMissing = true)
public class StubAiProvider implements AiProvider {

    @Override
    public boolean isLive() {
        return false;
    }

    // ─────────────────────────── 분석 ───────────────────────────

    @Override
    public AiAnalysisResult analyze(AiAnalysisRequest request) {
        boolean korean = request.locale() == Locale.KO;
        List<String> sentences = splitSentences(request.body());

        String summary = korean
                ? "AI가 %s를 분석한 내용입니다.".formatted("ARTICLE".equals(request.kind()) ? "기사" : "방송")
                : "This is an AI analysis of the %s.".formatted(
                        "ARTICLE".equals(request.kind()) ? "article" : "broadcast");

        List<AiAnalysisResult.Item> items = new ArrayList<>();
        items.add(new AiAnalysisResult.Item(
                korean ? "주요 내용" : "Key points",
                sentences.isEmpty() ? request.title() : sentences.get(0)));

        if (sentences.size() > 1) {
            items.add(new AiAnalysisResult.Item(
                    korean ? "팬 관점" : "For fans",
                    sentences.get(Math.min(1, sentences.size() - 1))));
        }

        return new AiAnalysisResult(summary, items);
    }

    /** 본문에서 문장을 뽑아냅니다. 용어 하이라이트 마크업은 제거합니다. */
    private static List<String> splitSentences(String body) {
        if (body == null || body.isBlank()) {
            return List.of();
        }
        String plain = body
                .replaceAll("\\[\\[([^|\\]]+)\\|[^\\]]*\\]\\]", "$1")  // [[용어|설명]] → 용어
                .replaceAll("\\[[^\\]]*\\]", " ")                       // [ 앵커멘트 ] 같은 섹션 라벨
                .replaceAll("\\s+", " ")
                .trim();

        return Arrays.stream(plain.split("(?<=[.!?])\\s+"))
                .map(String::trim)
                .filter(s -> s.length() >= 10)
                .limit(4)
                .toList();
    }

    // ─────────────────────────── 번역 ───────────────────────────

    @Override
    public String translate(String text, Locale targetLocale) {
        // 흉내 낸 번역을 돌려주면 진짜 번역처럼 보여 더 위험합니다. 명시적으로 실패시킵니다.
        throw new ApiException(
                ErrorCode.AI_PROVIDER_UNAVAILABLE,
                "번역은 AI 제공자 연결이 필요합니다. 시드 댓글은 미리 번역돼 있습니다.");
    }

    // ─────────────────────────── 대화 ───────────────────────────

    @Override
    public ChatAnswer answer(ChatQuestion question) {
        boolean korean = question.locale() == Locale.KO;

        if (!question.inScope()) {
            return new ChatAnswer(outOfScopeMessage(korean), List.of(), true);
        }
        if (question.evidence().isEmpty()) {
            return new ChatAnswer(noEvidenceMessage(korean), List.of(), false);
        }

        List<Evidence> citations = question.evidence().stream().limit(3).toList();
        return new ChatAnswer(compose(question, citations, korean), citations, false);
    }

    private static String outOfScopeMessage(boolean korean) {
        return korean
                ? "저는 MBN 방송과 트롯 아티스트 소식을 안내하는 AI 도우미 비엔이예요. "
                        + "그 밖의 질문에는 답변드리기 어렵습니다. 일정이나 모임, 콘텐츠에 대해 물어봐 주세요!"
                : "I'm Bienie, MBN's AI assistant for broadcast and trot artist news. "
                        + "I can't help with topics outside that. Try asking about schedules, "
                        + "gatherings, or content!";
    }

    private static String noEvidenceMessage(boolean korean) {
        return korean
                ? "관련된 정보를 찾지 못했어요. 다른 표현으로 다시 물어봐 주시겠어요?"
                : "I couldn't find anything about that. Could you rephrase your question?";
    }

    /** 의도별 템플릿. 사실 값은 전부 {@code Evidence.detail} 에서 옵니다. */
    private static String compose(ChatQuestion question, List<Evidence> citations, boolean korean) {
        Evidence top = citations.get(0);
        int more = citations.size() - 1;

        String base = switch (question.intent()) {
            // 한국어 조사는 앞 글자 받침에 따라 달라집니다. 템플릿에 "은(는)" 을 노출하면
            // 데모에서 기계가 만든 티가 나므로 조사가 필요 없는 문형을 씁니다.
            case SCHEDULE -> korean
                    ? "가장 가까운 일정은 '%s'이고, %s입니다.".formatted(top.title(), top.detail())
                    : "The closest one is '%s' — %s.".formatted(top.title(), top.detail());
            case GATHERING -> korean
                    ? "'%s' 모임이 모집 중이에요. (%s)".formatted(top.title(), top.detail())
                    : "The gathering '%s' is recruiting. (%s)".formatted(top.title(), top.detail());
            case CONTENT -> korean
                    ? "'%s'을(를) 추천드려요. %s".formatted(top.title(), top.detail())
                    : "I'd recommend '%s'. %s".formatted(top.title(), top.detail());
            case PLACE -> korean
                    ? "'%s'에 다녀가셨어요. (%s)".formatted(top.title(), top.detail())
                    : "'%s' was visited. (%s)".formatted(top.title(), top.detail());
            case TIP -> korean
                    ? "'%s' 안내를 확인해 보세요. %s".formatted(top.title(), top.detail())
                    : "Check out '%s'. %s".formatted(top.title(), top.detail());
            default -> korean
                    ? "'%s' 정보를 찾았어요. %s".formatted(top.title(), top.detail())
                    : "I found '%s'. %s".formatted(top.title(), top.detail());
        };

        if (more <= 0) {
            return base;
        }
        return base + (korean
                ? " 관련 항목 %d건도 함께 확인해 보세요.".formatted(more)
                : " There are %d more related items below.".formatted(more));
    }
}
