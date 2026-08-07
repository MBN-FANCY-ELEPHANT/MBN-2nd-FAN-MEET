package kr.co.mbn.trot.ai.provider;

import java.util.List;

import kr.co.mbn.trot.user.domain.Locale;

/**
 * 답변 요청.
 *
 * <p>{@code evidence} 는 이미 DB 에서 조회된 상태입니다. 벡터 DB 를 쓰지 않습니다 —
 * 데이터가 30~50건 수준이라 관련 후보를 전부 컨텍스트에 넣는 편이 정확하고 빠릅니다
 * (docs/ai-stack.md §5).
 *
 * <p>{@code inScope} 가 false 면 구현체는 LLM 을 호출하지 않고 거절 응답을 만듭니다.
 */
public record ChatQuestion(
        String text,
        Locale locale,
        Intent intent,
        boolean inScope,
        List<Evidence> evidence,
        /** 사용자가 응원하는 아티스트 이름. null 이면 프롬프트에 넣지 않습니다. */
        String artistName
) {
}
