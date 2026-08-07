package kr.co.mbn.trot.chat.domain;

/**
 * 음성 발화가 요구한 <b>기능 완료</b>의 종류.
 *
 * <p>docs/api-spec.yaml 의 {@code ChatAction.type} 과 값이 일치해야 합니다.
 *
 * <p>⚠️ 여기에 항목을 더하면 FE 의 확인 문구 키(`voice.action.*`)를 <b>7개 언어 전부</b>에
 * 추가해야 합니다. 문안은 BE 가 아니라 FE 가 만듭니다.
 */
public enum ChatActionType {
    /** 공연 응모 (쓰기). 대상은 {@code Schedule}. */
    CONCERT_ENTRY,
    /** 공연 응모 취소 (쓰기). 대상은 <b>이미 응모한</b> {@code Schedule}. */
    CONCERT_ENTRY_CANCEL,
    /** 모집 참여 신청 (쓰기). 대상은 {@code Gathering}. */
    GATHERING_JOIN,
    /** 모집 신청 취소 (쓰기). 대상은 <b>이미 신청한</b> {@code Gathering}. */
    GATHERING_CANCEL,
    /** 아티스트 무대 영상 (읽기 전용). */
    STAGE_VIDEO
}
