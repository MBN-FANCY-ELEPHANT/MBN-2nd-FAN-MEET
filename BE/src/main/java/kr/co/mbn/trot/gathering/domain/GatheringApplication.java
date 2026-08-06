package kr.co.mbn.trot.gathering.domain;

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
 * 모임 참여 신청. {@code (gatheringId, userId)} 가 UNIQUE 이므로 중복 신청이 DB 레벨에서 차단됩니다.
 * 취소 후 재신청은 새 행을 만들지 않고 기존 행의 상태를 {@code APPLIED} 로 되돌립니다.
 */
@Entity
@Table(name = "gathering_application",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_application_gathering_user",
                columnNames = {"gathering_id", "user_id"}))
public class GatheringApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gathering_id", nullable = false)
    private Long gatheringId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(length = 200)
    private String note;

    @Column(name = "applied_at", nullable = false)
    private Instant appliedAt;

    protected GatheringApplication() {
        // JPA
    }

    private GatheringApplication(Long gatheringId, Long userId, String note) {
        this.gatheringId = gatheringId;
        this.userId = userId;
        this.note = note;
        this.status = ApplicationStatus.APPLIED;
        this.appliedAt = Instant.now();
    }

    public static GatheringApplication apply(Long gatheringId, Long userId, String note) {
        return new GatheringApplication(gatheringId, userId, note);
    }

    /** 취소했던 신청을 다시 살립니다. */
    public void reapply(String note) {
        this.status = ApplicationStatus.APPLIED;
        this.note = note;
        this.appliedAt = Instant.now();
    }

    public void cancel() {
        this.status = ApplicationStatus.CANCELED;
    }

    public boolean isApplied() {
        return status == ApplicationStatus.APPLIED;
    }

    public Long getId() {
        return id;
    }

    public Long getGatheringId() {
        return gatheringId;
    }

    public Long getUserId() {
        return userId;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public String getNote() {
        return note;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }
}
