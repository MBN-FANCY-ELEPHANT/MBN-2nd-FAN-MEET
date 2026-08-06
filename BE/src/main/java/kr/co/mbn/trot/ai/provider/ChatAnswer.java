package kr.co.mbn.trot.ai.provider;

import java.util.List;

/**
 * 답변.
 *
 * <p>{@code outOfScope} 가 true 면 FE 는 근거 카드를 렌더링하지 않습니다
 * (docs/api-spec.yaml {@code ChatMessage.outOfScope}).
 */
public record ChatAnswer(
        String text,
        List<Evidence> citations,
        boolean outOfScope
) {
}
