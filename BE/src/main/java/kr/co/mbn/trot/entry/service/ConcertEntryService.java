package kr.co.mbn.trot.entry.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.entry.domain.ConcertEntry;
import kr.co.mbn.trot.entry.dto.ConcertEntryResponse;
import kr.co.mbn.trot.entry.repository.ConcertEntryRepository;
import kr.co.mbn.trot.notification.ConcertEntryCompletedEvent;
import kr.co.mbn.trot.schedule.domain.Schedule;
import kr.co.mbn.trot.schedule.repository.ScheduleRepository;
import kr.co.mbn.trot.user.repository.UserRepository;

/**
 * 공연 응모 (추첨 신청).
 *
 * <p><b>규칙은 하나입니다 — 1인 1공연 1매.</b> 매수 파라미터가 없고, 같은 일정에 두 번
 * 응모하면 409 입니다. 모임({@code Gathering}) 과 달리 <b>정원 경합이 없어</b> 원자적
 * 카운터도 비관적 락도 필요하지 않습니다. 중복만 막으면 됩니다.
 *
 * <p>음성 도우미의 {@code CONCERT_ENTRY} 액션도 REST 컨트롤러를 우회하지 않고
 * <b>이 서비스를 그대로 호출</b>합니다. 경로가 둘로 갈라지면 규칙이 어긋납니다.
 */
@Service
@Transactional(readOnly = true)
public class ConcertEntryService {

    private final ConcertEntryRepository entryRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ConcertEntryService(
            ConcertEntryRepository entryRepository,
            ScheduleRepository scheduleRepository,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher) {
        this.entryRepository = entryRepository;
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    /** 특정 공연의 내 응모 상태. 비로그인이면 {@code entered=false} 입니다 (401 아님). */
    public ConcertEntryResponse getEntryState(Long scheduleId, Long userId) {
        if (userId == null) {
            return ConcertEntryResponse.notEntered(scheduleId);
        }
        Schedule schedule = getSchedule(scheduleId);
        return entryRepository.findByScheduleIdAndUserId(scheduleId, userId)
                .map(entry -> ConcertEntryResponse.of(entry, schedule))
                .orElseGet(() -> ConcertEntryResponse.notEntered(scheduleId));
    }

    /** 내 응모 목록. 다른 스타의 응모는 걸러냅니다 (스타별 팬공간이라). */
    public List<ConcertEntryResponse> listMine(Long starId, Long userId) {
        if (userId == null) {
            return List.of();
        }
        List<ConcertEntry> entries = entryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (entries.isEmpty()) {
            return List.of();
        }

        Map<Long, Schedule> schedules = scheduleRepository
                .findAllById(entries.stream().map(ConcertEntry::getScheduleId).toList())
                .stream()
                .collect(Collectors.toMap(Schedule::getId, Function.identity()));

        return entries.stream()
                .map(entry -> {
                    Schedule schedule = schedules.get(entry.getScheduleId());
                    return (schedule != null && schedule.getStarId().equals(starId))
                            ? ConcertEntryResponse.of(entry, schedule)
                            : null;
                })
                .filter(Objects::nonNull)
                .toList();
    }

    /**
     * 응모 (1매).
     *
     * <p>중복 검사를 먼저 하지만 <b>유니크 제약이 최종 방어선</b>입니다. 음성 액션과 화면
     * 버튼이 거의 동시에 들어오면 검사 두 개가 모두 통과할 수 있습니다.
     */
    @Transactional
    public ConcertEntryResponse enter(Long scheduleId, Long userId) {
        Schedule schedule = getSchedule(scheduleId);

        // 이미 시작한 공연은 응모를 받지 않습니다. (응모 마감일 필드가 없어 시작 시각 기준)
        if (!schedule.getStartAt().isAfter(Instant.now())) {
            throw new ApiException(ErrorCode.ENTRY_CLOSED);
        }
        if (entryRepository.findByScheduleIdAndUserId(scheduleId, userId).isPresent()) {
            throw new ApiException(ErrorCode.ENTRY_ALREADY_EXISTS);
        }

        try {
            ConcertEntry saved = entryRepository.saveAndFlush(ConcertEntry.of(scheduleId, userId));
            String nickname = userRepository.findById(userId)
                    .map(user -> user.getNickname())
                    .orElse("사용자 #" + userId);
            eventPublisher.publishEvent(new ConcertEntryCompletedEvent(
                    saved.getId(),
                    userId,
                    nickname,
                    schedule.getTitle(),
                    schedule.getStartAt(),
                    schedule.getVenue(),
                    saved.getCreatedAt()));
            return ConcertEntryResponse.of(saved, schedule);
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(ErrorCode.ENTRY_ALREADY_EXISTS);
        }
    }

    @Transactional
    public void cancel(Long scheduleId, Long userId) {
        ConcertEntry entry = entryRepository.findByScheduleIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.ENTRY_NOT_FOUND));
        entryRepository.delete(entry);
    }

    private Schedule getSchedule(Long scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ApiException(ErrorCode.SCHEDULE_NOT_FOUND));
    }
}
