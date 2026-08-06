package kr.co.mbn.trot.auth.dto;

import kr.co.mbn.trot.user.dto.UserResponse;

/** docs/api-spec.yaml 의 {@code AuthResponse} 스키마와 1:1 대응. */
public record AuthResponse(
        String accessToken,
        UserResponse user
) {
}
