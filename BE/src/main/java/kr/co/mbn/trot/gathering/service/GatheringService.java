package kr.co.mbn.trot.gathering.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.gathering.domain.ApplicationStatus;
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

    /**
     * 내가 <b>지금 신청 중인</b> 모집 (최근 신청순).
     *
     * <p>⚠️ 취소한 신청도 행으로 남으므로 {@code APPLIED} 필터가 필수입니다.
     *
     * <p>이 메서드가 생기기 전에는 팬공간 「신청한 모집」이 <b>모집 중인 앞 3건</b>을
     * 대신 보여줬습니다 — 신청하지도 않은 모임이 "신청한 모집" 으로 뜨니 사용자가
     * 자기 신청 상태를 오해합니다.
     */
    public List<GatheringSummaryResponse> findMyApplied(Long starId, Long userId) {
        if (userId == null) {
            return List.of();
        }
        List<Long> ids = applicationRepository
                .findByUserIdAndStatusOrderByAppliedAtDesc(userId, ApplicationStatus.APPLIED)
                .stream()
                .map(GatheringApplication::getGatheringId)
                .toList();
        if (ids.isEmpty()) {
            return List.of();
        }
        return gatheringRepository.findAllById(ids).stream()
                .filter(g -> g.getStarId().equals(starId))
                .map(GatheringSummaryResponse::from)
                .toList();
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
     *
     * <p>⚠️ <b>{@code incrementIfAvailable} 뒤에는 신청 행을 반드시 다시 조회해야 합니다.</b>
     * 그 쿼리는 {@code clearAutomatically = true} 라 영속성 컨텍스트를 비웁니다. 증가 <b>전에</b>
     * 읽어둔 엔티티는 그 시점에 <b>준영속</b>이 되어, {@code reapply()} 를 호출해도 더티 체킹이
     * 일어나지 않고 <b>UPDATE 가 나가지 않습니다.</b>
     *
     * <p>이것 때문에 실제로 이런 버그가 있었습니다: 한 번 취소한 사용자가 다시 신청하면
     * 인원만 +1 되고 신청 행은 {@code CANCELED} 로 남습니다 → {@code isApplied()} 가 계속
     * false 라 <b>같은 사람이 무한히 다시 신청</b>할 수 있고, 그때마다 정원이 차올랐습니다
     * (한 명이 34/40 을 40/40 으로 만들었습니다).
     */
    @Transactional
    public GatheringApplicationResponse apply(Long gatheringId, Long userId, String note) {
        Gathering gathering = getGatheringEntity(gatheringId);

        if (gathering.getStatus() == GatheringStatus.CLOSED) {
            throw new ApiException(ErrorCode.GATHERING_CLOSED);
        }

        boolean alreadyApplied = applicationRepository
                .findByGatheringIdAndUserId(gatheringId, userId)
                .filter(GatheringApplication::isApplied)
                .isPresent();

        if (alreadyApplied) {
            throw new ApiException(ErrorCode.GATHERING_ALREADY_APPLIED);
        }

        // 동시성 방어선: 정원 미달일 때만 갱신되는 원자적 UPDATE
        int updated = gatheringRepository.incrementIfAvailable(gatheringId, GatheringStatus.RECRUITING);
        if (updated == 0) {
            throw new ApiException(ErrorCode.GATHERING_FULL);
        }

        // ⚠️ 위 UPDATE 가 컨텍스트를 비웠으므로 **여기서 다시 읽습니다** (메서드 주석 참고).
        GatheringApplication application = applicationRepository
                .findByGatheringIdAndUserId(gatheringId, userId)
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
