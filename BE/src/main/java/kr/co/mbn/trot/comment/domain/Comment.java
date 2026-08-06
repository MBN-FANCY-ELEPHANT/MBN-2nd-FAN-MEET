package kr.co.mbn.trot.comment.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * 콘텐츠 댓글. <b>대댓글은 없습니다</b> (디자인에 없음).
 *
 * <p>응답에는 작성자의 닉네임·아바타와 함께 <b>국가</b>가 내려갑니다.
 * 여러 국가의 댓글이 섞여 보이는 것이 "글로벌 팬덤"을 증명하는 가장 직접적인 장면입니다.
 */
@Entity
@Table(name = "comment",
        indexes = @Index(name = "idx_comment_content_created", columnList = "content_id, created_at"))
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 500)
    private String body;

    /** 비정규화 캐시. {@code CommentRepository.addLikeCount} 로만 변경하세요. */
    @Column(name = "like_count", nullable = false)
    private int likeCount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /** 소프트 삭제. 신고·관리 이력 보존을 위해 행을 지우지 않습니다. */
    @Column(name = "deleted_at")
    private Instant deletedAt;

    protected Comment() {
        // JPA
    }

    private Comment(Long contentId, User author, String body) {
        this.contentId = contentId;
        this.author = author;
        this.body = body;
        this.likeCount = 0;
        this.createdAt = Instant.now();
    }

    public static Comment write(Long contentId, User author, String body) {
        return new Comment(contentId, author, body);
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public boolean isAuthoredBy(Long userId) {
        return author.getId().equals(userId);
    }

    public Long getId() {
        return id;
    }

    public Long getContentId() {
        return contentId;
    }

    public User getAuthor() {
        return author;
    }

    public String getBody() {
        return body;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }
}
