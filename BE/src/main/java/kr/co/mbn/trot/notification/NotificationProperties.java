package kr.co.mbn.trot.notification;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.notification")
public class NotificationProperties {

    private String senderName = "MBN 트롯 팬덤";
    private final Email email = new Email();
    private final Sms sms = new Sms();

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public Email getEmail() {
        return email;
    }

    public Sms getSms() {
        return sms;
    }

    public static class Email {
        private String from = "";
        private String to = "";

        public String getFrom() { return from; }
        public void setFrom(String from) { this.from = from; }
        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
    }

    public static class Sms {
        private String apiKey = "";
        private String apiSecret = "";
        private String from = "";
        private String to = "";
        private String baseUrl = "https://api.solapi.com";

        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getApiSecret() { return apiSecret; }
        public void setApiSecret(String apiSecret) { this.apiSecret = apiSecret; }
        public String getFrom() { return from; }
        public void setFrom(String from) { this.from = from; }
        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
    }
}
