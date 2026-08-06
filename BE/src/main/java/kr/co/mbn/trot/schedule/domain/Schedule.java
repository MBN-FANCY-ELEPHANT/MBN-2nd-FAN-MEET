package kr.co.mbn.trot.schedule.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

/** 스타의 공식 일정. HOME 의 "다가오는 일정" 카드가 이 중 가장 가까운 미래 1건을 보여줍니다. */
@Entity
@Table(name = "schedule", indexes = @Index(name = "idx_schedule_star_start", columnList = "star_id, start_at"))
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "star_id", nullable = false)
    private Long starId;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleType type;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at")
    private Instant endAt;

    @Column(length = 200)
    private String venue;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private boolean official;

    @Column(name = "external_url", length = 500)
    private String externalUrl;

    protected Schedule() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public Long getStarId() {
        return starId;
    }

    public String getTitle() {
        return title;
    }

    public ScheduleType getType() {
        return type;
    }

    public Instant getStartAt() {
        return startAt;
    }

    public Instant getEndAt() {
        return endAt;
    }

    public String getVenue() {
        return venue;
    }

    public String getDescription() {
        return description;
    }

    public boolean isOfficial() {
        return official;
    }

    public String getExternalUrl() {
        return externalUrl;
    }
}
