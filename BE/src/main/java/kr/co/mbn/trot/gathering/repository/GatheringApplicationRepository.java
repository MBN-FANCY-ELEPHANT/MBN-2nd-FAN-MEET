package kr.co.mbn.trot.gathering.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.gathering.domain.ApplicationStatus;
import kr.co.mbn.trot.gathering.domain.GatheringApplication;

public interface GatheringApplicationRepository extends JpaRepository<GatheringApplication, Long> {

    Optional<GatheringApplication> findByGatheringIdAndUserId(Long gatheringId, Long userId);

    /**
     * 내가 <b>지금 신청 중인</b> 모집. 음성 "모집 신청 취소해줘" 의 대상 후보입니다.
     *
     * <p>⚠️ 취소한 신청도 행으로 남으므로 {@code status} 필터가 필수입니다.
     */
    List<GatheringApplication> findByUserIdAndStatusOrderByAppliedAtDesc(
            Long userId, ApplicationStatus status);
}
