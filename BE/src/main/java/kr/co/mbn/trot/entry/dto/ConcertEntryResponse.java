package kr.co.mbn.trot.entry.dto;

import java.time.Instant;

import kr.co.mbn.trot.entry.domain.ConcertEntry;
import kr.co.mbn.trot.schedule.domain.Schedule;

/** docs/api-spec.yaml 의 {@code ConcertEntry} 스키마와 1:1 대응. */
public record ConcertEntryResponse(
        Long scheduleId,
        boolean entered,
        Instant enteredAt,
        String scheduleTitle,
        Instant startAt
) {

    /** 아직 응모하지 않은 상태. 비로그인도 이 형태로 내려갑니다 (401 이 아닙니다). */
    public static ConcertEntryResponse notEntered(Long scheduleId) {
        return new ConcertEntryResponse(scheduleId, false, null, null, null);
    }

    public static ConcertEntryResponse of(ConcertEntry entry, Schedule schedule) {
        return new ConcertEntryResponse(
                entry.getScheduleId(),
                true,
                entry.getCreatedAt(),
                schedule == null ? null : schedule.getTitle(),
                schedule == null ? null : schedule.getStartAt());
    }
}
