package kr.co.mbn.trot.gathering.domain;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import kr.co.mbn.trot.user.domain.User;

/**
 * 팬 모임 (버스 대절 / 기부 / 응원 광고 / 단체 관람).
 *
 * <p>⚠️ {@code fee} 는 <b>표시 전용</b>입니다. 플랫폼은 결제를 중개하지 않으며 실제 송금은
 * 플랫폼 밖에서 이뤄집니다. (docs/domain-model.md, docs/mvp-scope.md)
 *
 * <p>⚠️ {@code currentCount} 는 동시 신청 경합 지점입니다. 반드시
 * {@code GatheringRepository.incrementIfAvailable} 의 원자적 UPDATE 로만 변경하세요.
 * 조회 후 저장(read-modify-write)하면 정원을 초과합니다.
 */
@Entity
@Table(name = "gathering",
        indexes = @Index(name = "idx_gathering_star_status", columnList = "star_id, status"))
public class Gathering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "star_id", nullable = false)
    private Long starId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GatheringType type;

    @Column(name = "cover_image_url", nullable = false, length = 500)
    private String coverImageUrl;

    @Column(length = 300)
    private String summary;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GatheringStatus status;

    @Column(name = "current_count", nullable = false)
    private int currentCount;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(name = "event_at", nullable = false)
    private Instant eventAt;

    @Column(name = "meeting_point", length = 200)
    private String meetingPoint;

    @Column(nullable = false)
    private int fee;

    @Column(name = "payment_info", length = 500)
    private String paymentInfo;

    @Column(name = "refund_policy", length = 500)
    private String refundPolicy;

    @Column(length = 1000)
    private String notice;

    @Column(nullable = false)
    private boolean official;

    protected Gathering() {
        // JPA
    }

    /**
     * 정원 도달/여유에 따른 상태 동기화. 원자적 카운트 변경 <b>이후</b>에 호출합니다.
     * CLOSED 는 운영자/기한에 의한 종료이므로 여기서 바꾸지 않습니다.
     */
    public void syncStatusWithCount() {
        if (status == GatheringStatus.CLOSED) {
            return;
        }
        status = (currentCount >= capacity) ? GatheringStatus.FULL : GatheringStatus.RECRUITING;
    }

    public boolean isAcceptingApplications() {
        return status == GatheringStatus.RECRUITING;
    }

    public Long getId() {
        return id;
    }

    public Long getStarId() {
        return starId;
    }

    public User getHost() {
        return host;
    }

    public String getTitle() {
        return title;
    }

    public GatheringType getType() {
        return type;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public String getSummary() {
        return summary;
    }

    public String getDescription() {
        return description;
    }

    public GatheringStatus getStatus() {
        return status;
    }

    public int getCurrentCount() {
        return currentCount;
    }

    public int getCapacity() {
        return capacity;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public Instant getEventAt() {
        return eventAt;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }

    public int getFee() {
        return fee;
    }

    public String getPaymentInfo() {
        return paymentInfo;
    }

    public String getRefundPolicy() {
        return refundPolicy;
    }

    public String getNotice() {
        return notice;
    }

    public boolean isOfficial() {
        return official;
    }
}
