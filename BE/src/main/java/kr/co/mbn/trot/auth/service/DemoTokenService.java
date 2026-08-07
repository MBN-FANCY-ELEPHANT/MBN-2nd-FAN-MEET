package kr.co.mbn.trot.auth.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 간이 인증 토큰. {@code userId} 를 HMAC-SHA256 으로 서명한 문자열입니다.
 *
 * <p><b>의도적으로 단순합니다.</b> 이번 해커톤은 정교한 인증·인가가 목표가 아니라
 * "로그인/로그아웃 상태 구분"만 필요합니다 (docs/design-spec.md §3).
 * 만료·리프레시·권한 클레임이 없습니다.
 *
 * <p>서명은 하는 이유: 서명이 없으면 클라이언트가 아무 userId 나 보내 다른 사람으로
 * 행세할 수 있습니다. 데모라도 그건 곤란하므로 위조만 막습니다.
 *
 * <p>형식: {@code <base64url(userId)>.<base64url(hmac)>}
 */
@Service
public class DemoTokenService {

    private static final Logger log = LoggerFactory.getLogger(DemoTokenService.class);

    private static final String ALGORITHM = "HmacSHA256";
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    /**
     * ⚠️ {@code application.yml} 의 {@code ${AUTH_SECRET:...}} 기본값은
     * <b>환경변수가 아예 없을 때만</b> 적용됩니다. {@code .env} 에 {@code AUTH_SECRET=} 처럼
     * <b>빈 값으로 존재하면</b> 빈 문자열이 그대로 주입되고, {@code SecretKeySpec} 이
     * {@code IllegalArgumentException: Empty key} 를 던져 <b>모든 로그인이 500</b> 이 됩니다.
     * (실제로 겪은 버그입니다.) 그래서 여기서 공백을 한 번 더 걸러냅니다.
     */
    private static final String FALLBACK_SECRET =
            "local-dev-only-secret-please-change-me-at-least-32-bytes";

    private final byte[] secret;

    public DemoTokenService(@Value("${app.auth.secret}") String secret) {
        String resolved = secret == null || secret.isBlank() ? FALLBACK_SECRET : secret;
        if (resolved.equals(FALLBACK_SECRET)) {
            log.warn("AUTH_SECRET 이 비어 있어 로컬 기본 키로 대체합니다. 운영에서는 반드시 설정하세요.");
        }
        this.secret = resolved.getBytes(StandardCharsets.UTF_8);
    }

    public String issue(Long userId) {
        String payload = ENCODER.encodeToString(String.valueOf(userId).getBytes(StandardCharsets.UTF_8));
        return payload + "." + sign(payload);
    }

    /** 서명이 유효하면 userId, 아니면 empty. 예외를 던지지 않습니다. */
    public Optional<Long> parse(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        int dot = token.indexOf('.');
        if (dot <= 0 || dot == token.length() - 1) {
            return Optional.empty();
        }
        String payload = token.substring(0, dot);
        String signature = token.substring(dot + 1);

        if (!constantTimeEquals(sign(payload), signature)) {
            return Optional.empty();
        }
        try {
            return Optional.of(Long.parseLong(new String(DECODER.decode(payload), StandardCharsets.UTF_8)));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(secret, ALGORITHM));
            return ENCODER.encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("토큰 서명에 실패했습니다.", e);
        }
    }

    /** 길이가 달라도 조기 반환하지 않도록 고정 시간 비교합니다. */
    private static boolean constantTimeEquals(String a, String b) {
        byte[] x = a.getBytes(StandardCharsets.UTF_8);
        byte[] y = b.getBytes(StandardCharsets.UTF_8);
        return java.security.MessageDigest.isEqual(x, y);
    }
}
