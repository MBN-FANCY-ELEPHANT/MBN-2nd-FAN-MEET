package kr.co.mbn.trot.notification;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

@Component
public class EntryNotificationContent {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter
            .ofPattern("yyyy년 M월 d일 HH:mm")
            .withZone(ZoneId.of("Asia/Seoul"));

    public String subject(ConcertEntryCompletedEvent event) {
        return "[MBN] 공연 응모 완료 - " + event.scheduleTitle();
    }

    public String emailBody(ConcertEntryCompletedEvent event) {
        return """
                공연 응모가 정상적으로 완료되었습니다.

                응모자: %s
                공연: %s
                공연 일시: %s
                장소: %s
                접수 번호: %s
                응모 일시: %s

                본 알림은 공연 응모 완료 안내입니다.
                """.formatted(
                event.nickname(), event.scheduleTitle(), format(event.startAt()),
                valueOrDash(event.venue()), receiptNumber(event), format(event.enteredAt()));
    }

    public String smsBody(ConcertEntryCompletedEvent event) {
        return """
                [MBN 공연 응모 완료]
                응모자: %s
                공연: %s
                일시: %s
                장소: %s
                접수: %s
                """.formatted(
                event.nickname(), event.scheduleTitle(), format(event.startAt()),
                valueOrDash(event.venue()), receiptNumber(event));
    }

    private String receiptNumber(ConcertEntryCompletedEvent event) {
        return "MBN-%06d".formatted(event.entryId());
    }

    private String format(java.time.Instant instant) {
        return instant == null ? "-" : DATE_TIME.format(instant);
    }

    private String valueOrDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
