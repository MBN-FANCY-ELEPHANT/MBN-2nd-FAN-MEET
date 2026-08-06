package kr.co.mbn.trot.comment.dto;

import kr.co.mbn.trot.user.domain.Locale;

public record CommentTranslationResponse(
        Long commentId,
        Locale locale,
        String translatedBody
) {
}
