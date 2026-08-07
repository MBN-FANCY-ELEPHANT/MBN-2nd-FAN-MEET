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

    /**
     * 모집 단체 대화방에서 연 세션이면 그 모임 id. 아니면 null.
     *
     * <p>이 값이 있으면 그 모임의 집결지·행사일·참가비·공지가 <b>모든 질문의 근거로 항상</b>
     * 들어가고, 스코프 판정도 느슨해집니다. 없으면 대화방 안에서 "집결지 어디예요?" 를
     * 물어도 "정보를 제공할 수 없습니다" 가 나갑니다 (실제로 겪음).
     */
    @Column(name = "gathering_id")
    private Long gatheringId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ChatSession() {
        // JPA
    }

    private ChatSession(
            Long userId, Long starId, Locale locale, String artistName, Long gatheringId) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.starId = starId;
        this.locale = locale;
        this.artistName = artistName;
        this.gatheringId = gatheringId;
        this.createdAt = Instant.now();
    }

    public static ChatSession open(
            Long userId, Long starId, Locale locale, String artistName, Long gatheringId) {
        return new ChatSession(userId, starId, locale, artistName, gatheringId);
    }

    public Long getGatheringId() {
        return gatheringId;
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
