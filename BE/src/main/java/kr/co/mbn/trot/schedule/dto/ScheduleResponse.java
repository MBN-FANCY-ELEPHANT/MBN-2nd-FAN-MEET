package kr.co.mbn.trot.schedule.dto;

import java.time.Instant;

import kr.co.mbn.trot.schedule.domain.Schedule;
import kr.co.mbn.trot.schedule.domain.ScheduleType;

/** docs/api-spec.yaml 의 {@code Schedule} 스키마와 1:1 대응. */
public record ScheduleResponse(
        Long id,
        String title,
        ScheduleType type,
        Instant startAt,
        Instant endAt,
        String venue,
        String description,
        boolean official,
        String externalUrl
) {

    public static ScheduleResponse from(Schedule s) {
        return new ScheduleResponse(
                s.getId(),
                s.getTitle(),
                s.getType(),
                s.getStartAt(),
                s.getEndAt(),
                s.getVenue(),
                s.getDescription(),
                s.isOfficial(),
                s.getExternalUrl());
    }
}
