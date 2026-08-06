package kr.co.mbn.trot.common.error;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
        ErrorCode code = ex.errorCode();
        if (code.status().is5xxServerError()) {
            log.error("API error: {}", code, ex);
        } else {
            log.debug("API error: {} - {}", code, ex.getMessage());
        }
        return ResponseEntity.status(code.status())
                .body(ErrorResponse.of(code, ex.getMessage()));
    }

    /**
     * 쿼리 파라미터 디코딩 실패 → 400.
     *
     * <p>UTF-8 이 아닌 바이트가 쿼리스트링에 섞이면 톰캣이 이 예외를 던집니다. 서버 잘못이
     * 아니라 요청이 잘못된 것이므로 500 이 아니라 400 이어야 합니다.
     * (Git Bash 가 한글을 CP949 로 보내면서 실제로 겪었습니다 — CLAUDE.md 함정 목록 참조)
     */
    @ExceptionHandler(org.apache.tomcat.util.http.InvalidParameterException.class)
    public ResponseEntity<ErrorResponse> handleInvalidParameter(
            org.apache.tomcat.util.http.InvalidParameterException ex) {

        log.debug("Query parameter decoding failed: {}", ex.getMessage());
        return ResponseEntity.status(ErrorCode.INVALID_REQUEST.status())
                .body(ErrorResponse.of(ErrorCode.INVALID_REQUEST,
                        "요청 파라미터를 해석할 수 없습니다. UTF-8 인코딩을 확인하세요."));
    }

    /** @Valid 검증 실패 → 400 + 필드별 사유 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
                .toList();

        return ResponseEntity.status(ErrorCode.INVALID_REQUEST.status())
                .body(ErrorResponse.of(
                        ErrorCode.INVALID_REQUEST,
                        ErrorCode.INVALID_REQUEST.defaultMessage(),
                        fieldErrors));
    }

    /**
     * 요청 본문을 읽지 못한 경우 → 400.
     * 잘못된 JSON, 잘못된 인코딩(UTF-8 아닌 바이트), 타입 불일치가 여기에 해당합니다.
     * 이 핸들러가 없으면 클라이언트 잘못을 500(서버 오류)으로 잘못 보고하게 됩니다.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(HttpMessageNotReadableException ex) {
        log.debug("Malformed request body: {}", ex.getMessage());
        return ResponseEntity.status(ErrorCode.INVALID_REQUEST.status())
                .body(ErrorResponse.of(
                        ErrorCode.INVALID_REQUEST,
                        "요청 본문을 해석할 수 없습니다. JSON 형식과 UTF-8 인코딩을 확인하세요."));
    }

    /** 쿼리 파라미터 타입 불일치(예: 존재하지 않는 enum 값) → 400. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.debug("Parameter type mismatch: {}", ex.getMessage());
        return ResponseEntity.status(ErrorCode.INVALID_REQUEST.status())
                .body(ErrorResponse.of(
                        ErrorCode.INVALID_REQUEST,
                        "잘못된 파라미터입니다.",
                        List.of(new ErrorResponse.FieldError(
                                ex.getName(), "허용되지 않는 값: " + ex.getValue()))));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(ErrorCode.INTERNAL_ERROR.status())
                .body(ErrorResponse.of(
                        ErrorCode.INTERNAL_ERROR,
                        ErrorCode.INTERNAL_ERROR.defaultMessage()));
    }
}
