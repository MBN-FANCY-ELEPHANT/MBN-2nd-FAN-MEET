package kr.co.mbn.trot.stage.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.stage.domain.ArtistStage;

/**
 * ⚠️ 13행짜리 표입니다. 부분 일치·별칭 매칭은 쿼리로 풀지 말고
 * {@code findAll()} 후 메모리에서 처리하세요 — 훨씬 읽기 쉽고 충분히 빠릅니다.
 */
public interface ArtistStageRepository extends JpaRepository<ArtistStage, Long> {

    Optional<ArtistStage> findByArtistName(String artistName);
}
