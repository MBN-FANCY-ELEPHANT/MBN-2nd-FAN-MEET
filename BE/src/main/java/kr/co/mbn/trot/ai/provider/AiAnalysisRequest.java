package kr.co.mbn.trot.ai.provider;

import kr.co.mbn.trot.user.domain.Locale;

/** 분석 대상. 본문이 없는 영상이면 {@code body} 가 null 입니다. */
public record AiAnalysisRequest(
        String title,
        String body,
        String kind,
        Locale locale
) {
}
