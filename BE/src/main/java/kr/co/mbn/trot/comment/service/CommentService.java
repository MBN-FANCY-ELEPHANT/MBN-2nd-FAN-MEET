package kr.co.mbn.trot.comment.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.ai.provider.AiProvider;
import kr.co.mbn.trot.comment.domain.Comment;
import kr.co.mbn.trot.comment.domain.CommentTranslation;
import kr.co.mbn.trot.comment.dto.CommentResponse;
import kr.co.mbn.trot.comment.dto.CommentTranslationResponse;
import kr.co.mbn.trot.comment.repository.CommentRepository;
import kr.co.mbn.trot.comment.repository.CommentTranslationRepository;
import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.content.repository.ContentRepository;
import kr.co.mbn.trot.reaction.domain.Reaction;
import kr.co.mbn.trot.reaction.domain.ReactionTargetType;
import kr.co.mbn.trot.reaction.repository.ReactionRepository;
import kr.co.mbn.trot.user.domain.Locale;
import kr.co.mbn.trot.user.domain.User;
import kr.co.mbn.trot.user.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentTranslationRepository translationRepository;
    private final ContentRepository contentRepository;
    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUser;
    private final AiProvider aiProvider;

    public CommentService(
            CommentRepository commentRepository,
            CommentTranslationRepository translationRepository,
            ContentRepository contentRepository,
            ReactionRepository reactionRepository,
            UserRepository userRepository,
            CurrentUserProvider currentUser,
            AiProvider aiProvider) {
        this.commentRepository = commentRepository;
        this.translationRepository = translationRepository;
        this.contentRepository = contentRepository;
        this.reactionRepository = reactionRepository;
        this.userRepository = userRepository;
        this.currentUser = currentUser;
        this.aiProvider = aiProvider;
    }

    public PageResponse<CommentResponse> getComments(Long contentId, Pageable pageable) {
        requireContent(contentId);

        Page<Comment> page =
                commentRepository.findByContentIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        contentId, pageable);

        // 내가 좋아요한 댓글을 한 번의 조회로 판별합니다 (댓글마다 조회하면 N+1).
        Set<Long> likedIds = findLikedCommentIds(
                page.getContent().stream().map(Comment::getId).toList());

        return PageResponse.from(page, c -> CommentResponse.from(c, likedIds.contains(c.getId())));
    }

    private Set<Long> findLikedCommentIds(List<Long> commentIds) {
        Optional<Long> userId = currentUser.findUserId();
        if (userId.isEmpty() || commentIds.isEmpty()) {
            return Set.of();
        }
        return reactionRepository
                .findByUserIdAndTargetTypeAndTargetIdIn(
                        userId.get(), ReactionTargetType.COMMENT, commentIds)
                .stream()
                .map(Reaction::getTargetId)
                .collect(Collectors.toSet());
    }

    @Transactional
    public CommentResponse create(Long contentId, String body) {
        Long userId = currentUser.requireUserId();
        requireContent(contentId);

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        Comment saved = commentRepository.save(Comment.write(contentId, author, body));
        contentRepository.addCommentCount(contentId, 1);

        return CommentResponse.from(saved, false);
    }

    @Transactional
    public void delete(Long commentId) {
        Long userId = currentUser.requireUserId();

        Comment comment = commentRepository.findWithAuthorByIdAndDeletedAtIsNull(commentId)
                .orElseThrow(() -> new ApiException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.isAuthoredBy(userId)) {
            throw new ApiException(ErrorCode.FORBIDDEN, "본인이 작성한 댓글만 삭제할 수 있습니다.");
        }

        comment.softDelete();
        contentRepository.addCommentCount(comment.getContentId(), -1);
    }

    /**
     * 댓글 번역. {@code (commentId, locale)} 단위로 캐싱하므로 두 번째 호출부터는
     * AI 를 거치지 않습니다. 시드 댓글은 미리 채워져 있습니다.
     */
    @Transactional
    public CommentTranslationResponse translate(Long commentId, Locale locale) {
        Comment comment = commentRepository.findWithAuthorByIdAndDeletedAtIsNull(commentId)
                .orElseThrow(() -> new ApiException(ErrorCode.COMMENT_NOT_FOUND));

        Optional<CommentTranslation> cached =
                translationRepository.findByCommentIdAndLocale(commentId, locale);
        if (cached.isPresent()) {
            return new CommentTranslationResponse(
                    commentId, locale, cached.get().getTranslatedBody());
        }

        String translated = aiProvider.translate(comment.getBody(), locale);
        translationRepository.save(CommentTranslation.of(commentId, locale, translated));

        return new CommentTranslationResponse(commentId, locale, translated);
    }

    private void requireContent(Long contentId) {
        if (!contentRepository.existsById(contentId)) {
            throw new ApiException(ErrorCode.CONTENT_NOT_FOUND);
        }
    }
}
