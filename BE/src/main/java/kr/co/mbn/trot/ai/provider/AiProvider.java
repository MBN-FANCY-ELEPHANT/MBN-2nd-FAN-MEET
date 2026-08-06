package kr.co.mbn.trot.ai.provider;

import kr.co.mbn.trot.user.domain.Locale;

/**
 * AI 호출 경계.
 *
 * <p><b>이 인터페이스가 존재하는 이유:</b> 어려운 부분(근거 검색, 스코프 제한, citations 구성,
 * SSE 스트리밍, 캐싱)은 전부 이 인터페이스 <i>바깥</i>에 있습니다. 안쪽은 "문자열을 받아
 * 문자열을 돌려주는" 얇은 층입니다. 그래서 {@code StubAiProvider} 로 파이프라인 전체를
 * 검증해 두고, API 키가 준비되면 {@code OpenAiProvider} 만 추가하면 됩니다.
 *
 * <p>구현체 교체는 {@code app.ai.provider} 프로퍼티로 합니다 (기본 {@code stub}).
 */
public interface AiProvider {

    /** 기사·영상 분석. 사전 생성 시점에만 호출되고 조회 시에는 호출되지 않습니다. */
    AiAnalysisResult analyze(AiAnalysisRequest request);

    /** 댓글 번역. 결과는 호출부에서 {@code (commentId, locale)} 단위로 캐싱됩니다. */
    String translate(String text, Locale targetLocale);

    /** AI 도우미 "비엔이" 답변. 근거는 이미 조회된 상태로 전달됩니다. */
    ChatAnswer answer(ChatQuestion question);

    /**
     * 실제 LLM 에 연결돼 있는지. false 면 스텁 응답입니다.
     * 시연 중 "이거 진짜 AI 맞나요?"에 정직하게 답하기 위한 플래그입니다.
     */
    boolean isLive();
}
