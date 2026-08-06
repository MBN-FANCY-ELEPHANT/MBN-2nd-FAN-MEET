package kr.co.mbn.trot.search.dto;

import java.util.List;

import kr.co.mbn.trot.content.dto.ContentSummaryResponse;
import kr.co.mbn.trot.gathering.dto.GatheringSummaryResponse;
import kr.co.mbn.trot.place.dto.PlaceResponse;
import kr.co.mbn.trot.schedule.dto.ScheduleResponse;
import kr.co.mbn.trot.tip.dto.TipSummaryResponse;

/** docs/api-spec.yaml 의 {@code GET /api/v1/search} 응답과 1:1 대응. */
public record SearchResponse(
        String query,
        List<ContentSummaryResponse> contents,
        List<ScheduleResponse> schedules,
        List<GatheringSummaryResponse> gatherings,
        List<PlaceResponse> places,
        List<TipSummaryResponse> tips
) {
}
