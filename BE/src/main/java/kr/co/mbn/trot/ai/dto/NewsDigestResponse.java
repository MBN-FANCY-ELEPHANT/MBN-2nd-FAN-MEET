package kr.co.mbn.trot.ai.dto;

import java.time.Instant;
import java.util.List;

import kr.co.mbn.trot.content.domain.ContentType;
import kr.co.mbn.trot.user.domain.Locale;

/** docs/api-spec.yaml 의 {@code NewsDigest} 스키마와 1:1 대응. */
public record NewsDigestResponse(
        Long starId,
        Locale locale,
        String summary,
        List<Item> items,
        List<Source> sources,
        Instant generatedAt
) {

    public record Item(String title, String body) {
    }

    /** 요약에 쓰인 원본. FE 에서 상세 화면으로 이동합니다. */
    public record Source(Long contentId, String title, ContentType type) {
    }
}
