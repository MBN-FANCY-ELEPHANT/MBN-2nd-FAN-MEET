package kr.co.mbn.trot.schedule.service;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.schedule.domain.Schedule;
import kr.co.mbn.trot.schedule.domain.ScheduleType;
import kr.co.mbn.trot.schedule.dto.ScheduleResponse;
import kr.co.mbn.trot.schedule.repository.ScheduleRepository;

@Service
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public PageResponse<ScheduleResponse> getSchedules(
            Long starId, boolean upcoming, ScheduleType type, Pageable pageable) {

        Instant now = Instant.now();
        Page<Schedule> page;

        if (type != null && upcoming) {
            page = scheduleRepository.findByStarIdAndTypeAndStartAtAfterOrderByStartAtAsc(
                    starId, type, now, pageable);
        } else if (type != null) {
            page = scheduleRepository.findByStarIdAndTypeOrderByStartAtAsc(starId, type, pageable);
        } else if (upcoming) {
            page = scheduleRepository.findByStarIdAndStartAtAfterOrderByStartAtAsc(starId, now, pageable);
        } else {
            page = scheduleRepository.findByStarIdOrderByStartAtAsc(starId, pageable);
        }

        return PageResponse.from(page, ScheduleResponse::from);
    }

    public ScheduleResponse getSchedule(Long id) {
        return scheduleRepository.findById(id)
                .map(ScheduleResponse::from)
                .orElseThrow(() -> new ApiException(ErrorCode.SCHEDULE_NOT_FOUND));
    }

    /** HOME 집계용 — 가장 가까운 미래 일정. 없으면 empty. */
    public Optional<ScheduleResponse> findUpcoming(Long starId) {
        return scheduleRepository
                .findFirstByStarIdAndStartAtAfterOrderByStartAtAsc(starId, Instant.now())
                .map(ScheduleResponse::from);
    }
}
