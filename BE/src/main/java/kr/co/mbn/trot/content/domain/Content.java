package kr.co.mbn.trot.content.domain;

import java.time.Instant;

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

/**
 * MBN 콘텐츠 — 기사 또는 영상. (구 {@code ArchiveContent})
 *
 * <p>⚠️ 영상은 자체 호스팅하지 않습니다 (저작권). {@code mediaUrl} 은 YouTube 등 외부 URL 이며
 * FE 는 iframe 임베드로 재생합니다.
 *
 * <p>⚠️ {@code live} 는 <b>실시간 스트리밍 연동이 아닙니다.</b> 플래그가 켜져 있으면 LIVE 배지를
 * 붙이고 {@code viewerCount} 를 그대로 표시할 뿐입니다 (docs/mvp-scope.md 컷 목록).
 */
@Entity
@Table(name = "content",
        indexes = @Index(name = "idx_content_star_published", columnList = "star_id, published_at"))
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "star_id", nullable = false)
    private Long starId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContentType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "thumbnail_url", nullable = false, length = 500)
    private String thumbnailUrl;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    @Column(name = "view_count", nullable = false)
    private int viewCount;

    /** 비정규화 캐시. {@code ContentRepository} 의 원자적 UPDATE 로만 변경하세요. */
    @Column(name = "like_count", nullable = false)
    private int likeCount;

    /** 비정규화 캐시. {@code ContentRepository} 의 원자적 UPDATE 로만 변경하세요. */
    @Column(name = "comment_count", nullable = false)
    private int commentCount;

    // ── ARTICLE 전용 ──

    /**
     * 기사 본문. 용어 하이라이트는 {@code [[용어|설명]]} 마크업으로 표기하며
     * FE 가 파싱해 툴팁으로 렌더합니다 (별도 API 없음).
     */
    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "reporter_name", length = 50)
    private String reporterName;

    @Column(name = "reporter_avatar_url", length = 500)
    private String reporterAvatarUrl;

    // ── VIDEO 전용 ──

    @Column(name = "media_url", length = 500)
    private String mediaUrl;

    @Column(name = "duration_sec")
    private Integer durationSec;

    @Column(nullable = false)
    private boolean live;

    @Column(name = "viewer_count")
    private Integer viewerCount;

    protected Content() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public Long getStarId() {
        return starId;
    }

    public Channel getChannel() {
        return channel;
    }

    public ContentType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public int getViewCount() {
        return viewCount;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public int getCommentCount() {
        return commentCount;
    }

    public String getBody() {
        return body;
    }

    public String getReporterName() {
        return reporterName;
    }

    public String getReporterAvatarUrl() {
        return reporterAvatarUrl;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public Integer getDurationSec() {
        return durationSec;
    }

    public boolean isLive() {
        return live;
    }

    public Integer getViewerCount() {
        return viewerCount;
    }
}
