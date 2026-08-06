package kr.co.mbn.trot.reaction.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.comment.repository.CommentRepository;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.content.repository.ContentRepository;
import kr.co.mbn.trot.reaction.domain.Reaction;
import kr.co.mbn.trot.reaction.domain.ReactionTargetType;
import kr.co.mbn.trot.reaction.dto.LikeStateResponse;
import kr.co.mbn.trot.reaction.repository.ReactionRepository;

/**
 * 좋아요 토글.
 *
 * <p>이미 좋아요한 상태에서 다시 좋아요를 눌러도 카운트가 두 번 오르지 않습니다(멱등).
 * 네트워크 재시도나 더블탭에서 값이 어긋나는 것을 막습니다.
 *
 * <p>카운트는 <b>반드시 원자적 UPDATE</b> 로만 변경합니다. 조회 후 저장하면 동시 요청에서
 * 갱신이 유실됩니다.
 */
@Service
@Transactional
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final ContentRepository contentRepository;
    private final CommentRepository commentRepository;
    private final CurrentUserProvider currentUser;

    public ReactionService(
            ReactionRepository reactionRepository,
            ContentRepository contentRepository,
            CommentRepository commentRepository,
            CurrentUserProvider currentUser) {
        this.reactionRepository = reactionRepository;
        this.contentRepository = contentRepository;
        this.commentRepository = commentRepository;
        this.currentUser = currentUser;
    }

    public LikeStateResponse likeContent(Long contentId) {
        Long userId = currentUser.requireUserId();
        requireContent(contentId);

        if (!reactionRepository.existsByUserIdAndTargetTypeAndTargetId(
                userId, ReactionTargetType.CONTENT, contentId)) {
            reactionRepository.save(
                    Reaction.like(userId, ReactionTargetType.CONTENT, contentId));
            contentRepository.addLikeCount(contentId, 1);
        }
        return new LikeStateResponse(true, contentLikeCount(contentId));
    }

    public LikeStateResponse unlikeContent(Long contentId) {
        Long userId = currentUser.requireUserId();
        requireContent(contentId);

        int removed = reactionRepository.deleteByUserIdAndTargetTypeAndTargetId(
                userId, ReactionTargetType.CONTENT, contentId);
        if (removed > 0) {
            contentRepository.addLikeCount(contentId, -1);
        }
        return new LikeStateResponse(false, contentLikeCount(contentId));
    }

    public LikeStateResponse likeComment(Long commentId) {
        Long userId = currentUser.requireUserId();
        requireComment(commentId);

        if (!reactionRepository.existsByUserIdAndTargetTypeAndTargetId(
                userId, ReactionTargetType.COMMENT, commentId)) {
            reactionRepository.save(
                    Reaction.like(userId, ReactionTargetType.COMMENT, commentId));
            commentRepository.addLikeCount(commentId, 1);
        }
        return new LikeStateResponse(true, commentLikeCount(commentId));
    }

    public LikeStateResponse unlikeComment(Long commentId) {
        Long userId = currentUser.requireUserId();
        requireComment(commentId);

        int removed = reactionRepository.deleteByUserIdAndTargetTypeAndTargetId(
                userId, ReactionTargetType.COMMENT, commentId);
        if (removed > 0) {
            commentRepository.addLikeCount(commentId, -1);
        }
        return new LikeStateResponse(false, commentLikeCount(commentId));
    }

    private void requireContent(Long id) {
        if (!contentRepository.existsById(id)) {
            throw new ApiException(ErrorCode.CONTENT_NOT_FOUND);
        }
    }

    private void requireComment(Long id) {
        if (commentRepository.findWithAuthorByIdAndDeletedAtIsNull(id).isEmpty()) {
            throw new ApiException(ErrorCode.COMMENT_NOT_FOUND);
        }
    }

    private int contentLikeCount(Long id) {
        return contentRepository.findById(id)
                .map(c -> c.getLikeCount())
                .orElseThrow(() -> new ApiException(ErrorCode.CONTENT_NOT_FOUND));
    }

    private int commentLikeCount(Long id) {
        return commentRepository.findById(id)
                .map(c -> c.getLikeCount())
                .orElseThrow(() -> new ApiException(ErrorCode.COMMENT_NOT_FOUND));
    }
}
