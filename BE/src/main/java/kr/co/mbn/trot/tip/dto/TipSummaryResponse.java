package kr.co.mbn.trot.tip.dto;

import java.time.Instant;

import kr.co.mbn.trot.tip.domain.Tip;
import kr.co.mbn.trot.tip.domain.TipCategory;

/** docs/api-spec.yaml 의 {@code TipSummary} 스키마와 1:1 대응. PLAY "응원하기" 카드용. */
public record TipSummaryResponse(
        Long id,
        String title,
        TipCategory category,
        String thumbnailUrl,
        Instant updatedAt
) {

    public static TipSummaryResponse from(Tip t) {
        return new TipSummaryResponse(
                t.getId(),
                t.getTitle(),
                t.getCategory(),
                t.getThumbnailUrl(),
                t.getUpdatedAt());
    }
}
