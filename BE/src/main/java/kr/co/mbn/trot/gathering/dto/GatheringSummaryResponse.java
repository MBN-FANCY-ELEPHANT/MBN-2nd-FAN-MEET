package kr.co.mbn.trot.gathering.dto;

import java.time.LocalDate;

import kr.co.mbn.trot.gathering.domain.Gathering;
import kr.co.mbn.trot.gathering.domain.GatheringStatus;
import kr.co.mbn.trot.gathering.domain.GatheringType;

/**
 * docs/api-spec.yaml 의 {@code GatheringSummary} 스키마와 1:1 대응.
 * 와이어프레임 COMMUNITY 카드가 이 필드들로 구성됩니다.
 */
public record GatheringSummaryResponse(
        Long id,
        String title,
        GatheringType type,
        GatheringStatus status,
        String coverImageUrl,
        String summary,
        int currentCount,
        int capacity,
        LocalDate deadline,
        String hostNickname,
        boolean official
) {

    /** ⚠️ host 가 LAZY 이므로 fetch join 된 엔티티로만 호출하세요. */
    public static GatheringSummaryResponse from(Gathering g) {
        return new GatheringSummaryResponse(
                g.getId(),
                g.getTitle(),
                g.getType(),
                g.getStatus(),
                g.getCoverImageUrl(),
                g.getSummary(),
                g.getCurrentCount(),
                g.getCapacity(),
                g.getDeadline(),
                g.getHost().getNickname(),
                g.isOfficial());
    }
}
