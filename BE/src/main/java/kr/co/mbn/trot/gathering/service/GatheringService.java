package kr.co.mbn.trot.gathering.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.gathering.domain.Gathering;
import kr.co.mbn.trot.gathering.domain.GatheringApplication;
import kr.co.mbn.trot.gathering.domain.GatheringStatus;
import kr.co.mbn.trot.gathering.domain.GatheringType;
import kr.co.mbn.trot.gathering.dto.GatheringApplicationResponse;
import kr.co.mbn.trot.gathering.dto.GatheringResponse;
import kr.co.mbn.trot.gathering.dto.GatheringSummaryResponse;
import kr.co.mbn.trot.gathering.repository.GatheringApplicationRepository;
import kr.co.mbn.trot.gathering.repository.GatheringRepository;

@Service
@Transactional(readOnly = true)
public class GatheringService {

    private final GatheringRepository gatheringRepository;
    private final GatheringApplicationRepository applicationRepository;

    public GatheringService(
            GatheringRepository gatheringRepository,
            GatheringApplicationRepository applicationRepository) {
        this.gatheringRepository = gatheringRepository;
        this.applicationRepository = applicationRepository;
    }

    // ─────────────────────────────── 조회 ───────────────────────────────

    public PageResponse<GatheringSummaryResponse> getGatherings(
            Long starId, GatheringStatus status, GatheringType type, Pageable pageable) {

        Page<Gathering> page;
        if (status != null && type != null) {
            page = gatheringRepository.findByStarIdAndStatusAndTypeOrderByDeadlineAsc(
                    starId, status, type, pageable);
        } else if (status != null) {
            page = gatheringRepository.findByStarIdAndStatusOrderByDeadlineAsc(starId, status, pageable);
        } else if (type != null) {
            page = gatheringRepository.findByStarIdAndTypeOrderByDeadlineAsc(starId, type, pageable);
        } else {
            page = gatheringRepository.findByStarIdOrderByDeadlineAsc(starId, pageable);
        }

        return PageResponse.from(page, GatheringSummaryResponse::from);
    }

    public GatheringResponse getGathering(Long id, Long currentUserId) {
        Gathering gathering = getGatheringEntity(id);

        GatheringApplicationResponse myApplication = (currentUserId == null)
                ? null
                : applicationRepository.findByGatheringIdAndUserId(id, currentUserId)
                        .filter(GatheringApplication::isApplied)
                        .map(GatheringApplicationResponse::from)
                        .orElse(null);

        return GatheringResponse.from(gathering, myApplication);
    }

    /** HOME 집계용 — 모집 중인 모임 4건. */
    public List<GatheringSummaryResponse> findRecruiting(Long starId) {
        return gatheringRepository
                .findTop4ByStarIdAndStatusOrderByDeadlineAsc(starId, GatheringStatus.RECRUITING)
                .stream()
                .map(GatheringSummaryResponse::from)
                .toList();
    }

    // ─────────────────────────── 신청 / 취소 ───────────────────────────

    /**
     * 참여 신청.
     *
     * <p>순서가 중요합니다. 인원 증가를 <b>먼저</b> 원자적으로 시도하고, 성공한 경우에만 신청 행을 만듭니다.
     * 반대로 하면 두 요청이 동시에 들어올 때 정원을 초과합니다.
     */
    @Transactional
    public GatheringApplicationResponse apply(Long gatheringId, Long userId, String note) {
        Gathering gathering = getGatheringEntity(gatheringId);

        if (gathering.getStatus() == GatheringStatus.CLOSED) {
            throw new ApiException(ErrorCode.GATHERING_CLOSED);
        }

        Optional<GatheringApplication> existing =
                applicationRepository.findByGatheringIdAndUserId(gatheringId, userId);

        if (existing.isPresent() && existing.get().isApplied()) {
            throw new ApiException(ErrorCode.GATHERING_ALREADY_APPLIED);
        }

        // 동시성 방어선: 정원 미달일 때만 갱신되는 원자적 UPDATE
        int updated = gatheringRepository.incrementIfAvailable(gatheringId, GatheringStatus.RECRUITING);
        if (updated == 0) {
            throw new ApiException(ErrorCode.GATHERING_FULL);
        }

        GatheringApplication application = existing
                .map(a -> {
                    a.reapply(note);
                    return a;
                })
                .orElseGet(() -> applicationRepository.save(
                        GatheringApplication.apply(gatheringId, userId, note)));

        syncStatus(gatheringId);

        return GatheringApplicationResponse.from(application);
    }

    @Transactional
    public void cancel(Long gatheringId, Long userId) {
        getGatheringEntity(gatheringId); // 존재하지 않으면 404

        GatheringApplication application = applicationRepository
                .findByGatheringIdAndUserId(gatheringId, userId)
                .filter(GatheringApplication::isApplied)
                .orElseThrow(() -> new ApiException(ErrorCode.GATHERING_APPLICATION_NOT_FOUND));

        application.cancel();
        gatheringRepository.decrement(gatheringId);

        syncStatus(gatheringId);
    }

    // ─────────────────────────────── 내부 ───────────────────────────────

    /** 원자적 카운트 변경 후 RECRUITING/FULL 상태를 실제 인원에 맞춥니다. */
    private void syncStatus(Long gatheringId) {
        Gathering fresh = getGatheringEntity(gatheringId);
        fresh.syncStatusWithCount();
    }

    private Gathering getGatheringEntity(Long id) {
        return gatheringRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.GATHERING_NOT_FOUND));
    }
}
