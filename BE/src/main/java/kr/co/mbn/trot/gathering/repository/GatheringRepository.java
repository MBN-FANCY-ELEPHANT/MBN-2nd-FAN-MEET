package kr.co.mbn.trot.gathering.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.co.mbn.trot.gathering.domain.Gathering;
import kr.co.mbn.trot.gathering.domain.GatheringStatus;
import kr.co.mbn.trot.gathering.domain.GatheringType;

public interface GatheringRepository extends JpaRepository<Gathering, Long> {

    // host 는 LAZY 이고 응답에 hostNickname 이 필요하므로 목록 조회는 항상 fetch join 합니다. (N+1 방지)

    @EntityGraph(attributePaths = "host")
    Page<Gathering> findByStarIdOrderByDeadlineAsc(Long starId, Pageable pageable);

    @EntityGraph(attributePaths = "host")
    Page<Gathering> findByStarIdAndStatusOrderByDeadlineAsc(
            Long starId, GatheringStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "host")
    Page<Gathering> findByStarIdAndTypeOrderByDeadlineAsc(
            Long starId, GatheringType type, Pageable pageable);

    @EntityGraph(attributePaths = "host")
    Page<Gathering> findByStarIdAndStatusAndTypeOrderByDeadlineAsc(
            Long starId, GatheringStatus status, GatheringType type, Pageable pageable);

    @EntityGraph(attributePaths = "host")
    List<Gathering> findTop4ByStarIdAndStatusOrderByDeadlineAsc(Long starId, GatheringStatus status);

    /**
     * 정원 미달일 때만 참여 인원을 1 증가시킵니다. <b>이것이 동시성 방어선입니다.</b>
     *
     * @return 갱신된 행 수. 0이면 이미 정원이 찼거나 모집 중이 아님 → 신청 거절.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Gathering g
               set g.currentCount = g.currentCount + 1
             where g.id = :id
               and g.status = :recruiting
               and g.currentCount < g.capacity
            """)
    int incrementIfAvailable(@Param("id") Long id, @Param("recruiting") GatheringStatus recruiting);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Gathering g
               set g.currentCount = g.currentCount - 1
             where g.id = :id
               and g.currentCount > 0
            """)
    int decrement(@Param("id") Long id);

    /** 통합 검색 — 제목 LIKE. host 가 LAZY 라 fetch join 이 필요합니다. */
    @EntityGraph(attributePaths = "host")
    java.util.List<Gathering> findByStarIdAndTitleContainingIgnoreCaseOrderByDeadlineAsc(
            Long starId, String keyword, Pageable pageable);
}
