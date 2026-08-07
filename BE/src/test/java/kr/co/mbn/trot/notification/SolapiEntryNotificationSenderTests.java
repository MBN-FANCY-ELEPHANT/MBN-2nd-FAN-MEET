package kr.co.mbn.trot.notification;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SolapiEntryNotificationSenderTests {

    @Test
    void createsHmacSha256AuthorizationHeader() {
        String authorization = SolapiEntryNotificationSender.createAuthorization(
                "test-api-key", "Jefe", "what do ya want ", "for nothing?");

        assertThat(authorization).endsWith(
                "signature=5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843");
    }
}
