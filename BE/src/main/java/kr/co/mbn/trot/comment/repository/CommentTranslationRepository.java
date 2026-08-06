package kr.co.mbn.trot.comment.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.comment.domain.CommentTranslation;
import kr.co.mbn.trot.user.domain.Locale;

public interface CommentTranslationRepository extends JpaRepository<CommentTranslation, Long> {

    Optional<CommentTranslation> findByCommentIdAndLocale(Long commentId, Locale locale);
}
