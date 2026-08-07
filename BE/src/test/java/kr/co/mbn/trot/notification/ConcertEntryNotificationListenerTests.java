package kr.co.mbn.trot.notification;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.time.Instant;

import org.junit.jupiter.api.Test;

class ConcertEntryNotificationListenerTests {

    @Test
    void smsStillRunsWhenEmailFails() {
        SmtpEntryNotificationSender emailSender = mock(SmtpEntryNotificationSender.class);
        SolapiEntryNotificationSender smsSender = mock(SolapiEntryNotificationSender.class);
        ConcertEntryNotificationListener listener =
                new ConcertEntryNotificationListener(emailSender, smsSender);
        ConcertEntryCompletedEvent event = new ConcertEntryCompletedEvent(
                1L, 2L, "호랑이", "MBN 팬미팅",
                Instant.parse("2026-08-09T09:00:00Z"), "서울",
                Instant.parse("2026-08-08T09:00:00Z"));
        doThrow(new IllegalStateException("smtp unavailable")).when(emailSender).send(event);

        listener.onEntryCompleted(event);

        verify(emailSender).send(event);
        verify(smsSender).send(event);
    }
}
