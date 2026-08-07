package kr.co.mbn.trot.gathering.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.gathering.domain.GatheringStatus;
import kr.co.mbn.trot.gathering.domain.GatheringType;
import kr.co.mbn.trot.gathering.dto.GatheringApplicationResponse;
import kr.co.mbn.trot.gathering.dto.GatheringApplyRequest;
import kr.co.mbn.trot.gathering.dto.GatheringResponse;
import kr.co.mbn.trot.gathering.dto.GatheringSummaryResponse;
import kr.co.mbn.trot.gathering.service.GatheringService;

@RestController
@RequestMapping("/api/v1/gatherings")
public class GatheringController {

    private final GatheringService gatheringService;
    private final CurrentUserProvider currentUserProvider;

    public GatheringController(
            GatheringService gatheringService, CurrentUserProvider currentUserProvider) {
        this.gatheringService = gatheringService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public PageResponse<GatheringSummaryResponse> getGatherings(
            @RequestParam Long starId,
            @RequestParam(required = false) GatheringStatus status,
            @RequestParam(required = false) GatheringType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return gatheringService.getGatherings(starId, status, type, PageRequest.of(page, size));
    }

    /**
     * 내가 <b>지금 신청 중인</b> 모집.
     *
     * <p>⚠️ {@code /{id}} 보다 <b>위에</b> 선언해야 합니다. 아래에 두면 {@code "mine"} 이
     * {@code id} 로 해석돼 400 이 납니다.
     *
     * <p>비로그인이면 빈 배열입니다 — 401 이 아닙니다. 팬공간 「신청한 모집」 섹션이
     * 그냥 접히면 되고, 로그인 여부로 화면이 깨지면 안 됩니다.
     */
    @GetMapping("/mine")
    public java.util.List<GatheringSummaryResponse> getMyGatherings(@RequestParam Long starId) {
        return gatheringService.findMyApplied(
                starId, currentUserProvider.findUserId().orElse(null));
    }

    /**
     * 모임 상세.
     *
     * <p>조회는 비로그인도 허용합니다. 로그인 상태에서만 {@code myApplication} 이 채워집니다
     * — 여기서 {@code requireUserId()} 를 쓰면 상세 화면 자체가 401 이 됩니다.
     */
    @GetMapping("/{id}")
    public GatheringResponse getGathering(@PathVariable Long id) {
        return gatheringService.getGathering(id, currentUserProvider.findUserId().orElse(null));
    }

    @PostMapping("/{id}/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public GatheringApplicationResponse apply(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid GatheringApplyRequest request) {

        String note = (request == null) ? null : request.note();
        return gatheringService.apply(id, currentUserProvider.requireUserId(), note);
    }

    @DeleteMapping("/{id}/applications/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable Long id) {
        gatheringService.cancel(id, currentUserProvider.requireUserId());
    }
}
