package kr.co.mbn.trot.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ConcertEntryNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(ConcertEntryNotificationListener.class);
    private final SmtpEntryNotificationSender emailSender;
    private final SolapiEntryNotificationSender smsSender;

    public ConcertEntryNotificationListener(
            SmtpEntryNotificationSender emailSender, SolapiEntryNotificationSender smsSender) {
        this.emailSender = emailSender;
        this.smsSender = smsSender;
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEntryCompleted(ConcertEntryCompletedEvent event) {
        sendSafely("email", event, () -> emailSender.send(event));
        sendSafely("sms", event, () -> smsSender.send(event));
    }

    private void sendSafely(String channel, ConcertEntryCompletedEvent event, Runnable send) {
        try {
            send.run();
        } catch (RuntimeException e) {
            log.error("공연 응모 알림 발송 실패: channel={}, entryId={}", channel, event.entryId(), e);
        }
    }
}
