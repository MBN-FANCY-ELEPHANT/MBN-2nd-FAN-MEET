package kr.co.mbn.trot.gathering.domain;

public enum GatheringStatus {
    /** 모집 중 */
    RECRUITING,
    /** 모집 완료 (정원 도달) */
    FULL,
    /** 마감 (기한 종료 또는 운영자 마감) */
    CLOSED
}
