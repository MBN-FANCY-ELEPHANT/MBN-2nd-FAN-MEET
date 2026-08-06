package kr.co.mbn.trot.reaction.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 좋아요. 취소는 행 삭제입니다.
 *
 * <p>대상 테이블의 {@code likeCount} 는 비정규화 캐시이며 <b>반드시 원자적 UPDATE 로만</b>
 * 증감시킵니다. 조회 후 저장하면 동시 요청에서 값이 어긋납니다.
 */
@Entity
@Table(name = "reaction",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_reaction_user_target",
                columnNames = {"user_id", "target_type", "target_id"}))
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private ReactionTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Reaction() {
        // JPA
    }

    private Reaction(Long userId, ReactionTargetType targetType, Long targetId) {
        this.userId = userId;
        this.targetType = targetType;
        this.targetId = targetId;
        this.createdAt = Instant.now();
    }

    public static Reaction like(Long userId, ReactionTargetType targetType, Long targetId) {
        return new Reaction(userId, targetType, targetId);
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public ReactionTargetType getTargetType() {
        return targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
