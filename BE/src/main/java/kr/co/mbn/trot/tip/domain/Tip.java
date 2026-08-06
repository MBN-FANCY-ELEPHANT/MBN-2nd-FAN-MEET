package kr.co.mbn.trot.tip.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 팬덤 팁 — PLAY 탭의 "응원하기". 투표·스트리밍·티켓팅 가이드.
 *
 * <p>{@code updatedAt} 은 화면에 <b>항상 노출</b>합니다. 투표/스밍 플랫폼 정책이 자주 바뀌어서
 * 언제 기준의 안내인지가 정보의 신뢰도를 좌우합니다.
 */
@Entity
@Table(name = "tip")
public class Tip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "star_id", nullable = false)
    private Long starId;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipCategory category;

    @Column(name = "thumbnail_url", nullable = false, length = 500)
    private String thumbnailUrl;

    /** 마크다운. */
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "external_url", length = 500)
    private String externalUrl;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Tip() {
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

    public TipCategory getCategory() {
        return category;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getContent() {
        return content;
    }

    public String getExternalUrl() {
        return externalUrl;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
