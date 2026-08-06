package kr.co.mbn.trot.place.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.place.domain.Place;
import kr.co.mbn.trot.place.domain.PlaceType;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    Page<Place> findByStarIdOrderByIdAsc(Long starId, Pageable pageable);

    Page<Place> findByStarIdAndTypeOrderByIdAsc(Long starId, PlaceType type, Pageable pageable);

    /** PLAY 집계 — 성지순례 가로 캐러셀. */
    List<Place> findTop10ByStarIdOrderByIdAsc(Long starId);

    /** 뉴스 상세의 "기사에 나온 그 곳". */
    List<Place> findByIdInOrderByIdAsc(List<Long> ids);

    List<Place> findByStarIdAndNameContainingIgnoreCaseOrderByIdAsc(
            Long starId, String keyword, Pageable pageable);
}
