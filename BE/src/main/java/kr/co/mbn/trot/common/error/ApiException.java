package kr.co.mbn.trot.common.error;

/**
 * 서비스 계층에서 던지는 표준 예외. {@link GlobalExceptionHandler} 가 HTTP 응답으로 변환합니다.
 * 컨트롤러에서 try/catch 하지 말고 그대로 전파시키세요.
 */
public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;

    public ApiException(ErrorCode errorCode) {
        super(errorCode.defaultMessage());
        this.errorCode = errorCode;
    }

    public ApiException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode errorCode() {
        return errorCode;
    }
}
