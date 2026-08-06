package kr.co.mbn.trot.chat.dto;

import jakarta.validation.constraints.NotNull;
import kr.co.mbn.trot.user.domain.Locale;

public record ChatSessionCreateRequest(
        @NotNull Long starId,
        Locale locale
) {
}
