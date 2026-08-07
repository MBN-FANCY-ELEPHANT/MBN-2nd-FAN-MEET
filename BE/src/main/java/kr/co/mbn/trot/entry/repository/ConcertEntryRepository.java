package kr.co.mbn.trot.entry.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.entry.domain.ConcertEntry;

public interface ConcertEntryRepository extends JpaRepository<ConcertEntry, Long> {

    Optional<ConcertEntry> findByScheduleIdAndUserId(Long scheduleId, Long userId);

    /** 내 응모 목록 — 최근 응모가 위로. 일정 정보는 서비스에서 붙입니다. */
    List<ConcertEntry> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByScheduleIdAndUserId(Long scheduleId, Long userId);
}
