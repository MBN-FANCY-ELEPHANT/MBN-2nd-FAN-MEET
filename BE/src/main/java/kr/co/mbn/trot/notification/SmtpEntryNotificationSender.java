package kr.co.mbn.trot.notification;

import java.nio.charset.StandardCharsets;

import jakarta.mail.MessagingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class SmtpEntryNotificationSender {

    private static final Logger log = LoggerFactory.getLogger(SmtpEntryNotificationSender.class);
    private final JavaMailSender mailSender;
    private final NotificationProperties properties;
    private final EntryNotificationContent content;
    private final String smtpHost;

    public SmtpEntryNotificationSender(
            JavaMailSender mailSender,
            NotificationProperties properties,
            EntryNotificationContent content,
            @Value("${spring.mail.host:}") String smtpHost) {
        this.mailSender = mailSender;
        this.properties = properties;
        this.content = content;
        this.smtpHost = smtpHost;
    }

    public void send(ConcertEntryCompletedEvent event) {
        NotificationProperties.Email email = properties.getEmail();
        if (isBlank(smtpHost) || isBlank(email.getFrom()) || isBlank(email.getTo())) {
            log.debug("공연 응모 이메일 건너뜀: SMTP 또는 발신/수신 주소가 설정되지 않았습니다.");
            return;
        }
        try {
            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setFrom(email.getFrom(), properties.getSenderName());
            helper.setTo(email.getTo());
            helper.setSubject(content.subject(event));
            helper.setText(content.emailBody(event), false);
            mailSender.send(message);
            log.info("공연 응모 이메일 발송 완료: entryId={}", event.entryId());
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new IllegalStateException("공연 응모 이메일을 만들 수 없습니다.", e);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
