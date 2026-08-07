package kr.co.mbn.trot.entry.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 공연 응모 (추첨 신청).
 *
 * <p>⚠️ <b>1인 1공연 1매입니다.</b> 매수 컬럼이 없습니다 — 디자인 확정 과정에서 매수 선택
 * UI 가 빠지고 "응모하기" 버튼 하나로 정리됐습니다. 유니크 제약이 곧 그 규칙입니다.
 *
 * <p>⚠️ <b>결제가 아닙니다.</b> 당첨 이후 실제 예매는 공식 예매처에서 이뤄지고 플랫폼은
 * 금전 거래를 중개하지 않습니다 (기획서 정책 — 협상 대상 아님). 화면에도 고지가 있습니다.
 *
 * <p>취소는 <b>행을 지웁니다.</b> {@code GatheringApplication} 처럼 상태를 남기지 않는
 * 이유는 응모에 정원 카운터가 없어서 이력을 되짚을 필요가 없기 때문입니다.
 */
@Entity
@Table(
        name = "concert_entry",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_concert_entry_schedule_user",
                columnNames = {"schedule_id", "user_id"}))
public class ConcertEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ConcertEntry() {
        // JPA
    }

    private ConcertEntry(Long scheduleId, Long userId, Instant createdAt) {
        this.scheduleId = scheduleId;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public static ConcertEntry of(Long scheduleId, Long userId) {
        return new ConcertEntry(scheduleId, userId, Instant.now());
    }

    public Long getId() {
        return id;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public Long getUserId() {
        return userId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
