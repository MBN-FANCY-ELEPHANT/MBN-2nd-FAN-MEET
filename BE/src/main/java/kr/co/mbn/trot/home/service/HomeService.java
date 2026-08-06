package kr.co.mbn.trot.home.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.content.service.ContentService;
import kr.co.mbn.trot.gathering.service.GatheringService;
import kr.co.mbn.trot.home.dto.HomeResponse;
import kr.co.mbn.trot.home.dto.PlayResponse;
import kr.co.mbn.trot.place.service.PlaceService;
import kr.co.mbn.trot.schedule.service.ScheduleService;
import kr.co.mbn.trot.star.service.StarService;
import kr.co.mbn.trot.tip.service.TipService;

/**
 * 탭 화면 집계. 각 도메인 서비스를 조합만 하고 자체 로직은 갖지 않습니다.
 * 새 섹션이 추가되면 해당 도메인 서비스에 조회 메서드를 만들고 여기서 호출하세요.
 */
@Service
@Transactional(readOnly = true)
public class HomeService {

    private final StarService starService;
    private final ScheduleService scheduleService;
    private final ContentService contentService;
    private final GatheringService gatheringService;
    private final PlaceService placeService;
    private final TipService tipService;

    public HomeService(
            StarService starService,
            ScheduleService scheduleService,
            ContentService contentService,
            GatheringService gatheringService,
            PlaceService placeService,
            TipService tipService) {
        this.starService = starService;
        this.scheduleService = scheduleService;
        this.contentService = contentService;
        this.gatheringService = gatheringService;
        this.placeService = placeService;
        this.tipService = tipService;
    }

    public HomeResponse getHome(Long starId) {
        return new HomeResponse(
                starService.getStar(starId), // 스타가 없으면 여기서 404
                scheduleService.findUpcoming(starId).orElse(null),
                contentService.findLatest(starId),
                gatheringService.findRecruiting(starId));
    }

    public PlayResponse getPlay(Long starId) {
        starService.getStar(starId); // 존재 확인 — 없으면 404
        return new PlayResponse(
                placeService.findForPlay(starId),
                tipService.findForPlay(starId));
    }
}
