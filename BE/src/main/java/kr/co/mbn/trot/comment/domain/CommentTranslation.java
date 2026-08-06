package kr.co.mbn.trot.comment.domain;

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
import kr.co.mbn.trot.user.domain.Locale;

/**
 * 댓글 번역 캐시.
 *
 * <p>번역 버튼을 누를 때마다 LLM 을 호출하면 느리고 비쌉니다.
 * {@code (commentId, locale)} 단위로 한 번만 번역하고 이후에는 DB 에서 읽습니다.
 */
@Entity
@Table(name = "comment_translation",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_comment_translation", columnNames = {"comment_id", "locale"}))
public class CommentTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "comment_id", nullable = false)
    private Long commentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Locale locale;

    @Column(name = "translated_body", nullable = false, length = 1000)
    private String translatedBody;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CommentTranslation() {
        // JPA
    }

    private CommentTranslation(Long commentId, Locale locale, String translatedBody) {
        this.commentId = commentId;
        this.locale = locale;
        this.translatedBody = translatedBody;
        this.createdAt = Instant.now();
    }

    public static CommentTranslation of(Long commentId, Locale locale, String translatedBody) {
        return new CommentTranslation(commentId, locale, translatedBody);
    }

    public Long getId() {
        return id;
    }

    public Long getCommentId() {
        return commentId;
    }

    public Locale getLocale() {
        return locale;
    }

    public String getTranslatedBody() {
        return translatedBody;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
