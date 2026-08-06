package kr.co.mbn.trot.comment.dto;

import java.time.Instant;

import kr.co.mbn.trot.comment.domain.Comment;
import kr.co.mbn.trot.user.dto.UserResponse;

/**
 * docs/api-spec.yaml 의 {@code Comment} 스키마와 1:1 대응.
 *
 * <p>{@code author} 에 국가가 포함돼 있어 FE 가 국가 배지를 그릴 수 있습니다.
 */
public record CommentResponse(
        Long id,
        Long contentId,
        UserResponse author,
        String body,
        int likeCount,
        boolean liked,
        Instant createdAt
) {

    public static CommentResponse from(Comment c, boolean liked) {
        return new CommentResponse(
                c.getId(),
                c.getContentId(),
                UserResponse.from(c.getAuthor()),
                c.getBody(),
                c.getLikeCount(),
                liked,
                c.getCreatedAt());
    }
}
