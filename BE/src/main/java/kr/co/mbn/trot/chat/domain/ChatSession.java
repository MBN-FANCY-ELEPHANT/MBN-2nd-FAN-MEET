package kr.co.mbn.trot.chat.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import kr.co.mbn.trot.user.domain.Locale;

/** AI 도우미 "비엔이" 대화 세션. 비회원도 생성할 수 있어 {@code userId} 가 null 일 수 있습니다. */
@Entity
@Table(name = "chat_session")
public class ChatSession {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "star_id", nullable = false)
    private Long starId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Locale locale;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ChatSession() {
        // JPA
    }

    private ChatSession(Long userId, Long starId, Locale locale) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.starId = starId;
        this.locale = locale;
        this.createdAt = Instant.now();
    }

    public static ChatSession open(Long userId, Long starId, Locale locale) {
        return new ChatSession(userId, starId, locale);
    }

    public String getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getStarId() {
        return starId;
    }

    public Locale getLocale() {
        return locale;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
