package kr.co.mbn.trot.schedule.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.schedule.domain.Schedule;
import kr.co.mbn.trot.schedule.domain.ScheduleType;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    Page<Schedule> findByStarIdOrderByStartAtAsc(Long starId, Pageable pageable);

    Page<Schedule> findByStarIdAndStartAtAfterOrderByStartAtAsc(
            Long starId, Instant after, Pageable pageable);

    Page<Schedule> findByStarIdAndTypeOrderByStartAtAsc(
            Long starId, ScheduleType type, Pageable pageable);

    Page<Schedule> findByStarIdAndTypeAndStartAtAfterOrderByStartAtAsc(
            Long starId, ScheduleType type, Instant after, Pageable pageable);

    /** HOME 의 "다가오는 일정" — 가장 가까운 미래 일정 1건. */
    Optional<Schedule> findFirstByStarIdAndStartAtAfterOrderByStartAtAsc(Long starId, Instant after);

    /** 통합 검색 — 제목 LIKE. 데이터가 적어 이 정도로 충분합니다. */
    java.util.List<Schedule> findByStarIdAndTitleContainingIgnoreCaseOrderByStartAtAsc(
            Long starId, String keyword, Pageable pageable);
}
