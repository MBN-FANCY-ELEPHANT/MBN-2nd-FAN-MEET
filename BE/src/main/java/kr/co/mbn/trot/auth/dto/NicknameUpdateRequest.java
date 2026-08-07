package kr.co.mbn.trot.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 랜덤으로 받은 닉네임을 팬이 직접 고른 값으로 바꾸는 요청입니다. */
public record NicknameUpdateRequest(
        @NotBlank @Size(min = 2, max = 30) String nickname
) {
}
