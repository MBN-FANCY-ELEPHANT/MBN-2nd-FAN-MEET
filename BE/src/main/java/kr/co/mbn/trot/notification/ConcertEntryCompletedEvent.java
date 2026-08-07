package kr.co.mbn.trot.notification;

import java.time.Instant;

/** 응모 트랜잭션이 커밋된 뒤 이메일과 문자를 만들 때 필요한 불변 스냅샷. */
public record ConcertEntryCompletedEvent(
        Long entryId,
        Long userId,
        String nickname,
        String scheduleTitle,
        Instant startAt,
        String venue,
        Instant enteredAt
) {
}
