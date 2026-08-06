package kr.co.mbn.trot.ai.dto;

import java.time.Instant;
import java.util.List;

import kr.co.mbn.trot.ai.domain.AiAnalysis;
import kr.co.mbn.trot.user.domain.Locale;

/** docs/api-spec.yaml 의 {@code AiAnalysis} 스키마와 1:1 대응. */
public record AiAnalysisResponse(
        Long contentId,
        Locale locale,
        String summary,
        List<Item> items,
        Instant generatedAt
) {

    public record Item(String title, String body) {
    }

    public static AiAnalysisResponse from(AiAnalysis a) {
        return new AiAnalysisResponse(
                a.getContentId(),
                a.getLocale(),
                a.getSummary(),
                a.getItems().stream().map(i -> new Item(i.getTitle(), i.getBody())).toList(),
                a.getGeneratedAt());
    }
}
