package kr.co.mbn.trot.ai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.ai.domain.AiAnalysis;
import kr.co.mbn.trot.user.domain.Locale;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {

    Optional<AiAnalysis> findByContentIdAndLocale(Long contentId, Locale locale);

    boolean existsByContentIdAndLocale(Long contentId, Locale locale);
}
