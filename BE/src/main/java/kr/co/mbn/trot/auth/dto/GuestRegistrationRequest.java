package kr.co.mbn.trot.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kr.co.mbn.trot.user.domain.Country;
import kr.co.mbn.trot.user.domain.Locale;

/** 랜딩의 스타 선택을 비밀번호 없는 게스트 사용자로 전환하는 요청입니다. */
public record GuestRegistrationRequest(
        @NotNull Long starId,
        @NotBlank @Size(max = 60) String artistName,
        Locale locale,
        Country country
) {
}
