package kr.co.mbn.trot.gathering.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.gathering.domain.GatheringApplication;

public interface GatheringApplicationRepository extends JpaRepository<GatheringApplication, Long> {

    Optional<GatheringApplication> findByGatheringIdAndUserId(Long gatheringId, Long userId);
}
