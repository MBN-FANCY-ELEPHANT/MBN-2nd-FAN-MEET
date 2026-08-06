package kr.co.mbn.trot.subscription.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/** 채널 구독. 영상 상세의 "구독 ↔ 구독 중" 토글에 대응합니다. */
@Entity
@Table(name = "subscription",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_subscription_user_channel", columnNames = {"user_id", "channel_id"}))
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "channel_id", nullable = false)
    private Long channelId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Subscription() {
        // JPA
    }

    private Subscription(Long userId, Long channelId) {
        this.userId = userId;
        this.channelId = channelId;
        this.createdAt = Instant.now();
    }

    public static Subscription of(Long userId, Long channelId) {
        return new Subscription(userId, channelId);
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getChannelId() {
        return channelId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
