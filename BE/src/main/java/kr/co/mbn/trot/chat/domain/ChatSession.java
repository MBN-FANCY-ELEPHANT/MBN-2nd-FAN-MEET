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

    /** 랜딩에서 고른 응원 아티스트. 없으면 시드 스타로 답합니다. */
    @Column(name = "artist_name", length = 60)
    private String artistName;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ChatSession() {
        // JPA
    }

    private ChatSession(Long userId, Long starId, Locale locale, String artistName) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.starId = starId;
        this.locale = locale;
        this.artistName = artistName;
        this.createdAt = Instant.now();
    }

    public static ChatSession open(
            Long userId, Long starId, Locale locale, String artistName) {
        return new ChatSession(userId, starId, locale, artistName);
    }

    public String getArtistName() {
        return artistName;
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
