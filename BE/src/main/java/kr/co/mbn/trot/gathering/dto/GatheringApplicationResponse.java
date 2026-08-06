package kr.co.mbn.trot.gathering.dto;

import java.time.Instant;

import kr.co.mbn.trot.gathering.domain.ApplicationStatus;
import kr.co.mbn.trot.gathering.domain.GatheringApplication;

/** docs/api-spec.yaml 의 {@code GatheringApplication} 스키마와 1:1 대응. */
public record GatheringApplicationResponse(
        Long id,
        Long gatheringId,
        ApplicationStatus status,
        String note,
        Instant appliedAt
) {

    public static GatheringApplicationResponse from(GatheringApplication a) {
        return new GatheringApplicationResponse(
                a.getId(),
                a.getGatheringId(),
                a.getStatus(),
                a.getNote(),
                a.getAppliedAt());
    }
}
