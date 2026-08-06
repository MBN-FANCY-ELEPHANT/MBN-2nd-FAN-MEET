package kr.co.mbn.trot.content.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.content.domain.ContentPlace;

public interface ContentPlaceRepository extends JpaRepository<ContentPlace, Long> {

    List<ContentPlace> findByContentIdOrderBySortOrderAsc(Long contentId);

    List<ContentPlace> findByPlaceIdOrderBySortOrderAsc(Long placeId);
}
