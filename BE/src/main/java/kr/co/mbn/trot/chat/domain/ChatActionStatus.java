package kr.co.mbn.trot.chat.domain;

/**
 * 액션 실행 결과.
 *
 * <p><b>실패도 정상 응답입니다.</b> "이미 신청하셨어요" 는 에러가 아니라 안내이고, 음성
 * 흐름에서 500/409 를 만나면 사용자는 무엇이 잘못됐는지 알 수 없습니다. 그래서 HTTP 상태로
 * 올리지 않고 여기 status 로 내려 FE 가 문장으로 읽어줍니다.
 */
public enum ChatActionStatus {
    /** 실행 성공 (응모 완료 · 신청 완료) */
    DONE,
    /** 이미 신청·응모한 대상 */
    ALREADY,
    /** 정원 마감 (모집 전용) */
    FULL,
    /** 마감된 대상 (종료된 모집 · 지난 공연) */
    CLOSED,
    /** 조건에 맞는 대상을 못 찾음 */
    NOT_FOUND,
    /** 미로그인 — 쓰기 액션에서만 발생합니다 */
    LOGIN_REQUIRED,
    /** 조회형 액션 성공 (STAGE_VIDEO) */
    FOUND
}
