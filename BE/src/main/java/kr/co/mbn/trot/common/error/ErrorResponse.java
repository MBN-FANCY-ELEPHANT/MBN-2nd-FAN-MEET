package kr.co.mbn.trot.common.error;

import java.util.List;

/**
 * docs/api-spec.yaml 의 {@code ErrorResponse} 스키마와 1:1 대응합니다.
 */
public record ErrorResponse(
        String code,
        String message,
        List<FieldError> fieldErrors
) {

    public record FieldError(String field, String reason) {
    }

    public static ErrorResponse of(ErrorCode code, String message) {
        return new ErrorResponse(code.name(), message, null);
    }

    public static ErrorResponse of(ErrorCode code, String message, List<FieldError> fieldErrors) {
        return new ErrorResponse(code.name(), message, fieldErrors);
    }
}
