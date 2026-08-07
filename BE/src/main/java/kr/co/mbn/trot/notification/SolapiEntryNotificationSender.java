package kr.co.mbn.trot.notification;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class SolapiEntryNotificationSender {

    private static final Logger log = LoggerFactory.getLogger(SolapiEntryNotificationSender.class);
    static final String LMS_SUBJECT = "[MBN 응모 완료]";
    private final RestClient client;
    private final NotificationProperties properties;
    private final EntryNotificationContent content;

    public SolapiEntryNotificationSender(NotificationProperties properties, EntryNotificationContent content) {
        this.client = RestClient.builder().baseUrl(properties.getSms().getBaseUrl()).build();
        this.properties = properties;
        this.content = content;
    }

    public void send(ConcertEntryCompletedEvent event) {
        NotificationProperties.Sms sms = properties.getSms();
        if (!isConfigured(sms)) {
            log.debug("공연 응모 문자 건너뜀: SOLAPI 또는 발신/수신 번호가 설정되지 않았습니다.");
            return;
        }

        String date = Instant.now().toString();
        String salt = UUID.randomUUID().toString().replace("-", "");
        String authorization = createAuthorization(sms.getApiKey(), sms.getApiSecret(), date, salt);
        SolapiResponse response = client.post()
                .uri("/messages/v4/send-many/detail")
                .header("Authorization", authorization)
                .body(new SolapiRequest(
                        List.of(new SolapiMessage(
                                digitsOnly(sms.getTo()), digitsOnly(sms.getFrom()),
                                content.smsBody(event), LMS_SUBJECT, true)),
                        true, false, true))
                .retrieve()
                .body(SolapiResponse.class);

        if (response == null) {
            throw new IllegalStateException("SOLAPI 응답을 확인할 수 없습니다.");
        }
        if (response.failedMessageList() != null && !response.failedMessageList().isEmpty()) {
            SolapiFailure failure = response.failedMessageList().get(0);
            throw new IllegalStateException(
                    "SOLAPI 발송 접수 실패: " + failure.statusCode() + " " + failure.statusMessage());
        }
        log.info("공연 응모 문자 발송 접수 완료: entryId={}", event.entryId());
    }

    static String createAuthorization(String apiKey, String apiSecret, String date, String salt) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(apiSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String signature = HexFormat.of().formatHex(
                    mac.doFinal((date + salt).getBytes(StandardCharsets.UTF_8)));
            return "HMAC-SHA256 apiKey=%s, date=%s, salt=%s, signature=%s"
                    .formatted(apiKey, date, salt, signature);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("SOLAPI 인증 서명을 만들 수 없습니다.", e);
        }
    }

    private boolean isConfigured(NotificationProperties.Sms sms) {
        return !isBlank(sms.getApiKey()) && !isBlank(sms.getApiSecret())
                && !isBlank(sms.getFrom()) && !isBlank(sms.getTo());
    }

    private boolean isBlank(String value) { return value == null || value.isBlank(); }
    private String digitsOnly(String phoneNumber) { return phoneNumber.replaceAll("[^0-9]", ""); }

    private record SolapiRequest(
            List<SolapiMessage> messages, boolean strict, boolean allowDuplicates, boolean showMessageList) {}
    private record SolapiMessage(
            String to, String from, String text, String subject, boolean autoTypeDetect) {}
    private record SolapiResponse(List<SolapiFailure> failedMessageList) {}
    private record SolapiFailure(String statusCode, String statusMessage) {}
}
