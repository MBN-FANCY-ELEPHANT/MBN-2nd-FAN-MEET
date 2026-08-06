package kr.co.mbn.trot.place.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.content.domain.ContentPlace;
import kr.co.mbn.trot.content.repository.ContentPlaceRepository;
import kr.co.mbn.trot.place.domain.Place;
import kr.co.mbn.trot.place.domain.PlaceType;
import kr.co.mbn.trot.place.dto.PlaceResponse;
import kr.co.mbn.trot.place.repository.PlaceRepository;

@Service
@Transactional(readOnly = true)
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final ContentPlaceRepository contentPlaceRepository;

    public PlaceService(
            PlaceRepository placeRepository, ContentPlaceRepository contentPlaceRepository) {
        this.placeRepository = placeRepository;
        this.contentPlaceRepository = contentPlaceRepository;
    }

    public PageResponse<PlaceResponse> getPlaces(Long starId, PlaceType type, Pageable pageable) {
        Page<Place> page = (type == null)
                ? placeRepository.findByStarIdOrderByIdAsc(starId, pageable)
                : placeRepository.findByStarIdAndTypeOrderByIdAsc(starId, type, pageable);

        return PageResponse.from(page, PlaceResponse::from);
    }

    public PlaceResponse getPlace(Long id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PLACE_NOT_FOUND));

        List<Long> relatedContentIds = contentPlaceRepository
                .findByPlaceIdOrderBySortOrderAsc(id).stream()
                .map(ContentPlace::getContentId)
                .toList();

        return PlaceResponse.from(place, relatedContentIds);
    }

    /** PLAY 집계용 — 성지순례 가로 캐러셀. */
    public List<PlaceResponse> findForPlay(Long starId) {
        return placeRepository.findTop10ByStarIdOrderByIdAsc(starId).stream()
                .map(PlaceResponse::from)
                .toList();
    }
}
