package kr.co.mbn.trot.chat.dto;

import java.util.List;

/** 세션 생성 응답. {@code suggestedQuestions} 는 음성 오버레이 진입 시 칩으로 노출합니다. */
public record ChatSessionResponse(
        String sessionId,
        List<String> suggestedQuestions
) {
}
