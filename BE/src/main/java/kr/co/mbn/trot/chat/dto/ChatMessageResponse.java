package kr.co.mbn.trot.chat.dto;

import java.time.Instant;
import java.util.List;

import kr.co.mbn.trot.ai.provider.CitationType;
import kr.co.mbn.trot.chat.domain.ChatMessage;
import kr.co.mbn.trot.chat.domain.MessageRole;

/** docs/api-spec.yaml 의 {@code ChatMessage} 스키마와 1:1 대응. */
public record ChatMessageResponse(
        Long id,
        MessageRole role,
        String content,
        boolean outOfScope,
        List<Citation> citations,
        Instant createdAt
) {

    /** {@code route} 는 FEATURE 근거에서만 채워집니다 (docs/api-spec.yaml Citation). */
    public record Citation(CitationType type, Long id, String title, String route) {
    }

    public static ChatMessageResponse from(ChatMessage m) {
        return new ChatMessageResponse(
                m.getId(),
                m.getRole(),
                m.getContent(),
                m.isOutOfScope(),
                m.getCitations().stream()
                        .map(c -> new Citation(
                                c.getType(), c.getTargetId(), c.getTitle(), c.getRoute()))
                        .toList(),
                m.getCreatedAt());
    }
}
