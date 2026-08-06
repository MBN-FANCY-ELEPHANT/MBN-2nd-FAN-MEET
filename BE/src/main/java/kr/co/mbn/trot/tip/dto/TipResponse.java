package kr.co.mbn.trot.tip.dto;

import java.time.Instant;

import kr.co.mbn.trot.tip.domain.Tip;
import kr.co.mbn.trot.tip.domain.TipCategory;

/** docs/api-spec.yaml 의 {@code Tip} 스키마와 1:1 대응. */
public record TipResponse(
        Long id,
        String title,
        TipCategory category,
        String thumbnailUrl,
        Instant updatedAt,
        String content,
        String externalUrl
) {

    public static TipResponse from(Tip t) {
        return new TipResponse(
                t.getId(),
                t.getTitle(),
                t.getCategory(),
                t.getThumbnailUrl(),
                t.getUpdatedAt(),
                t.getContent(),
                t.getExternalUrl());
    }
}
