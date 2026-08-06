package kr.co.mbn.trot.search.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.content.dto.ContentSummaryResponse;
import kr.co.mbn.trot.content.repository.ContentRepository;
import kr.co.mbn.trot.gathering.dto.GatheringSummaryResponse;
import kr.co.mbn.trot.gathering.repository.GatheringRepository;
import kr.co.mbn.trot.place.dto.PlaceResponse;
import kr.co.mbn.trot.place.repository.PlaceRepository;
import kr.co.mbn.trot.schedule.dto.ScheduleResponse;
import kr.co.mbn.trot.schedule.repository.ScheduleRepository;
import kr.co.mbn.trot.search.dto.SearchResponse;
import kr.co.mbn.trot.tip.dto.TipSummaryResponse;
import kr.co.mbn.trot.tip.repository.TipRepository;

/**
 * 통합 검색.
 *
 * <p><b>제목 LIKE 검색으로 충분합니다.</b> 데이터가 30~50건 수준이라 형태소 분석기나
 * 외부 검색 엔진을 붙여도 체감 차이가 없고, 운영 비용만 늘어납니다
 * (docs/mvp-scope.md P1 #15).
 *
 * <p>카테고리별로 상위 N건씩 묶어 반환합니다 — 한 카테고리가 결과를 독점하지 않게 하려는 것입니다.
 */
@Service
@Transactional(readOnly = true)
public class SearchService {

    private final ContentRepository contentRepository;
    private final ScheduleRepository scheduleRepository;
    private final GatheringRepository gatheringRepository;
    private final PlaceRepository placeRepository;
    private final TipRepository tipRepository;

    public SearchService(
            ContentRepository contentRepository,
            ScheduleRepository scheduleRepository,
            GatheringRepository gatheringRepository,
            PlaceRepository placeRepository,
            TipRepository tipRepository) {
        this.contentRepository = contentRepository;
        this.scheduleRepository = scheduleRepository;
        this.gatheringRepository = gatheringRepository;
        this.placeRepository = placeRepository;
        this.tipRepository = tipRepository;
    }

    public SearchResponse search(Long starId, String query, int limitPerCategory) {
        String keyword = query.trim();
        Pageable limit = PageRequest.of(0, limitPerCategory);

        return new SearchResponse(
                keyword,
                contentRepository
                        .findByStarIdAndTitleContainingIgnoreCaseOrderByPublishedAtDesc(
                                starId, keyword, limit)
                        .stream().map(ContentSummaryResponse::from).toList(),
                scheduleRepository
                        .findByStarIdAndTitleContainingIgnoreCaseOrderByStartAtAsc(
                                starId, keyword, limit)
                        .stream().map(ScheduleResponse::from).toList(),
                gatheringRepository
                        .findByStarIdAndTitleContainingIgnoreCaseOrderByDeadlineAsc(
                                starId, keyword, limit)
                        .stream().map(GatheringSummaryResponse::from).toList(),
                placeRepository
                        .findByStarIdAndNameContainingIgnoreCaseOrderByIdAsc(starId, keyword, limit)
                        .stream().map(PlaceResponse::from).toList(),
                tipRepository
                        .findByStarIdAndTitleContainingIgnoreCaseOrderByUpdatedAtDesc(
                                starId, keyword, limit)
                        .stream().map(TipSummaryResponse::from).toList());
    }
}
