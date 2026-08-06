package kr.co.mbn.trot.home.dto;

import java.util.List;

import kr.co.mbn.trot.place.dto.PlaceResponse;
import kr.co.mbn.trot.tip.dto.TipSummaryResponse;

/**
 * PLAY 화면 집계 응답.
 *
 * <p>디자인의 섹션명을 그대로 따릅니다 — {@code places} = 성지순례, {@code tips} = 응원하기.
 */
public record PlayResponse(
        List<PlaceResponse> places,
        List<TipSummaryResponse> tips
) {
}
