package kr.co.mbn.trot.home.dto;

import java.util.List;

import kr.co.mbn.trot.content.dto.ContentSummaryResponse;
import kr.co.mbn.trot.gathering.dto.GatheringSummaryResponse;
import kr.co.mbn.trot.schedule.dto.ScheduleResponse;
import kr.co.mbn.trot.star.dto.StarResponse;

/**
 * HOME 화면 집계 응답. docs/api-spec.yaml 의 {@code GET /api/v1/stars/{starId}/home} 과 1:1 대응.
 *
 * <p>HOME 탭의 4개 섹션을 한 번의 왕복으로 채우기 위한 BFF 성격의 응답입니다.
 * {@code upcomingSchedule} 은 예정 일정이 없으면 null 입니다.
 *
 * <p>{@code contents} 는 아카이브 캐러셀이며 <b>기사와 영상이 섞여서</b> 최신순으로 옵니다.
 */
public record HomeResponse(
        StarResponse star,
        ScheduleResponse upcomingSchedule,
        List<ContentSummaryResponse> contents,
        List<GatheringSummaryResponse> gatherings
) {
}
