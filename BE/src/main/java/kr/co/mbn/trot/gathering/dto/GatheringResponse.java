package kr.co.mbn.trot.gathering.dto;

import java.time.Instant;
import java.time.LocalDate;

import kr.co.mbn.trot.gathering.domain.Gathering;
import kr.co.mbn.trot.gathering.domain.GatheringStatus;
import kr.co.mbn.trot.gathering.domain.GatheringType;

/**
 * docs/api-spec.yaml 의 {@code Gathering} 스키마와 1:1 대응.
 * 스펙에서 {@code allOf: [GatheringSummary, ...]} 이므로 요약 필드를 모두 포함합니다.
 * 상세 화면에 중복 노출되던 description은 API 응답에서 제외합니다.
 */
public record GatheringResponse(
        Long id,
        String title,
        GatheringType type,
        GatheringStatus status,
        String coverImageUrl,
        String summary,
        int currentCount,
        int capacity,
        LocalDate deadline,
        String hostNickname,
        boolean official,
        Instant eventAt,
        String meetingPoint,
        int fee,
        String paymentInfo,
        String refundPolicy,
        String notice,
        GatheringApplicationResponse myApplication
) {

    public static GatheringResponse from(Gathering g, GatheringApplicationResponse myApplication) {
        return new GatheringResponse(
                g.getId(),
                g.getTitle(),
                g.getType(),
                g.getStatus(),
                g.getCoverImageUrl(),
                g.getSummary(),
                g.getCurrentCount(),
                g.getCapacity(),
                g.getDeadline(),
                g.getHost().getNickname(),
                g.isOfficial(),
                g.getEventAt(),
                g.getMeetingPoint(),
                g.getFee(),
                g.getPaymentInfo(),
                g.getRefundPolicy(),
                g.getNotice(),
                myApplication);
    }
}
