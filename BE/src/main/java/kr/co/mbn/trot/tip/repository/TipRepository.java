package kr.co.mbn.trot.tip.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.tip.domain.Tip;
import kr.co.mbn.trot.tip.domain.TipCategory;

public interface TipRepository extends JpaRepository<Tip, Long> {

    Page<Tip> findByStarIdOrderByUpdatedAtDesc(Long starId, Pageable pageable);

    Page<Tip> findByStarIdAndCategoryOrderByUpdatedAtDesc(
            Long starId, TipCategory category, Pageable pageable);

    /** PLAY 집계 — 응원하기 2열 그리드. */
    List<Tip> findTop6ByStarIdOrderByUpdatedAtDesc(Long starId);

    List<Tip> findByStarIdAndTitleContainingIgnoreCaseOrderByUpdatedAtDesc(
            Long starId, String keyword, Pageable pageable);
}
