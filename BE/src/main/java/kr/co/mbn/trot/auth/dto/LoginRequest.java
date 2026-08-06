package kr.co.mbn.trot.auth.dto;

import jakarta.validation.constraints.NotNull;

/** 데모 로그인 요청. 비밀번호를 검증하지 않고 {@code userId} 만으로 토큰을 발급합니다. */
public record LoginRequest(
        @NotNull Long userId
) {
}
