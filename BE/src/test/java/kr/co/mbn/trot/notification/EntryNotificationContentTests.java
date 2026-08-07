package kr.co.mbn.trot.notification;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Test;

class EntryNotificationContentTests {

    private final EntryNotificationContent content = new EntryNotificationContent();

    @Test
    void formatsReceiptAndTimesInKoreaTime() {
        ConcertEntryCompletedEvent event = new ConcertEntryCompletedEvent(
                42L, 7L, "호랑이", "MBN 트롯가왕 본선 3차",
                Instant.parse("2026-08-09T09:30:00Z"), "MBN 미디어센터",
                Instant.parse("2026-08-08T05:00:00Z"));

        assertThat(content.emailBody(event))
                .contains("접수 번호: MBN-000042")
                .contains("2026년 8월 9일 18:30");
        assertThat(content.smsBody(event)).contains("접수: MBN-000042");
    }
}
