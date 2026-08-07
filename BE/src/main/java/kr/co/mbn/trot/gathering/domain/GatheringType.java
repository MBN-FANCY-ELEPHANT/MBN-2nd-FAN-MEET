package kr.co.mbn.trot.gathering.domain;

/**
 * 모집 종류.
 *
 * <p>⚠️ <b>두 가지만 다룹니다.</b> 응원 광고 공동구매(`AD`) · 단체 관람(`GROUP_VIEWING`) ·
 * 기타(`ETC`) 는 <b>제거됐습니다</b> — 팬이 실제로 모집을 여는 상황은 이동 수단과 모금
 * 둘로 좁혀지고, 종류가 늘어날수록 목록에서 무엇을 신청하는 건지 알기 어려워집니다.
 * (되살리려면 {@code docs/api-spec.yaml} 의 {@code GatheringType} 부터 고치세요.)
 */
public enum GatheringType {
    /** 버스 대절 — 공연장까지 함께 이동 */
    BUS,
    /** 기부금 모금 */
    DONATION
}
