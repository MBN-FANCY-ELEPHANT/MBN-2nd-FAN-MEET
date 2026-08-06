package kr.co.mbn.trot.common.error;

import org.springframework.http.HttpStatus;

/**
 * API 에러 코드. 응답의 {@code code} 필드로 그대로 노출되므로,
 * 새 코드를 추가하면 docs/api-spec.yaml 의 ErrorResponse 예시도 함께 갱신하세요.
 */
public enum ErrorCode {

    // 공통
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "요청 값이 올바르지 않습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다."),

    // 리소스
    STAR_NOT_FOUND(HttpStatus.NOT_FOUND, "스타를 찾을 수 없습니다."),
    SCHEDULE_NOT_FOUND(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다."),
    CONTENT_NOT_FOUND(HttpStatus.NOT_FOUND, "콘텐츠를 찾을 수 없습니다."),
    CHANNEL_NOT_FOUND(HttpStatus.NOT_FOUND, "채널을 찾을 수 없습니다."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."),
    GATHERING_NOT_FOUND(HttpStatus.NOT_FOUND, "모임을 찾을 수 없습니다."),
    PLACE_NOT_FOUND(HttpStatus.NOT_FOUND, "장소를 찾을 수 없습니다."),
    TIP_NOT_FOUND(HttpStatus.NOT_FOUND, "팁을 찾을 수 없습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),

    // 모임 참여
    GATHERING_ALREADY_APPLIED(HttpStatus.CONFLICT, "이미 신청한 모임입니다."),
    GATHERING_APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "신청 내역이 없습니다."),
    GATHERING_FULL(HttpStatus.UNPROCESSABLE_ENTITY, "모집 인원이 마감되었습니다."),
    GATHERING_CLOSED(HttpStatus.UNPROCESSABLE_ENTITY, "모집이 종료된 모임입니다."),

    // AI
    AI_ANALYSIS_NOT_FOUND(HttpStatus.NOT_FOUND, "AI 분석 결과가 아직 없습니다."),
    AI_PROVIDER_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "AI 서비스를 일시적으로 사용할 수 없습니다."),

    // 챗봇
    CHAT_SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "대화 세션을 찾을 수 없습니다."),
    CHAT_RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "잠시 후 다시 시도해 주세요.");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus status() {
        return status;
    }

    public String defaultMessage() {
        return defaultMessage;
    }
}
