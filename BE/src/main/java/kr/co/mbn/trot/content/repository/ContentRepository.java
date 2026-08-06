package kr.co.mbn.trot.content.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.co.mbn.trot.content.domain.Content;
import kr.co.mbn.trot.content.domain.ContentType;

public interface ContentRepository extends JpaRepository<Content, Long> {

    // ── 목록 ──
    // channel 은 LAZY 이고 카드에 channelName 이 필요하므로 목록 조회는 전부 fetch join 합니다 (N+1 방지).

    @EntityGraph(attributePaths = "channel")
    Page<Content> findByStarIdOrderByPublishedAtDesc(Long starId, Pageable pageable);

    @EntityGraph(attributePaths = "channel")
    Page<Content> findByStarIdAndTypeOrderByPublishedAtDesc(
            Long starId, ContentType type, Pageable pageable);

    @EntityGraph(attributePaths = "channel")
    Page<Content> findByStarIdAndLiveOrderByPublishedAtDesc(
            Long starId, boolean live, Pageable pageable);

    @EntityGraph(attributePaths = "channel")
    Page<Content> findByStarIdAndTypeAndLiveOrderByPublishedAtDesc(
            Long starId, ContentType type, boolean live, Pageable pageable);

    /** HOME 가로 캐러셀 — 기사·영상을 섞어서 최신 10건. */
    @EntityGraph(attributePaths = "channel")
    List<Content> findTop10ByStarIdOrderByPublishedAtDesc(Long starId);

    /** 상세 화면 하단 "관련 콘텐츠 / 관련 영상" — 같은 스타의 다른 콘텐츠. */
    @EntityGraph(attributePaths = "channel")
    List<Content> findByStarIdAndIdNotOrderByPublishedAtDesc(Long starId, Long excludeId, Pageable pageable);

    @EntityGraph(attributePaths = "channel")
    Optional<Content> findWithChannelById(Long id);

    /** AI 도우미 근거 검색 / 통합 검색용. */
    @EntityGraph(attributePaths = "channel")
    List<Content> findByStarIdAndTitleContainingIgnoreCaseOrderByPublishedAtDesc(
            Long starId, String keyword, Pageable pageable);

    // ── 비정규화 카운트 (원자적 UPDATE 전용) ──
    // 조회 후 저장하면 동시 요청에서 값이 어긋납니다. 반드시 아래 메서드로만 변경하세요.

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Content c set c.likeCount = c.likeCount + :delta where c.id = :id")
    void addLikeCount(@Param("id") Long id, @Param("delta") int delta);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Content c set c.commentCount = c.commentCount + :delta where c.id = :id")
    void addCommentCount(@Param("id") Long id, @Param("delta") int delta);
}
