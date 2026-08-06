package kr.co.mbn.trot.comment.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.co.mbn.trot.comment.domain.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    /** author 는 LAZY 이고 목록에 닉네임·아바타·국가가 전부 필요하므로 fetch join 합니다. */
    @EntityGraph(attributePaths = "author")
    Page<Comment> findByContentIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            Long contentId, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Optional<Comment> findWithAuthorByIdAndDeletedAtIsNull(Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Comment c set c.likeCount = c.likeCount + :delta where c.id = :id")
    void addLikeCount(@Param("id") Long id, @Param("delta") int delta);
}
