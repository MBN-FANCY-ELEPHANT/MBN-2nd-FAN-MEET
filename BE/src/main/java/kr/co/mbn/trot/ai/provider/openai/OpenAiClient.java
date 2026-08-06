package kr.co.mbn.trot.ai.provider.openai;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;

/**
 * OpenAI REST 호출 래퍼.
 *
 * <p><b>공식 SDK 대신 RestClient 를 쓰는 이유:</b> 실제로 쓰는 엔드포인트가
 * {@code /chat/completions} 하나뿐이라, SDK 를 넣으면 버전 드리프트와 전이 의존성만
 * 늘어납니다. 해커톤에서는 REST 형태를 직접 고정하는 편이 예측 가능하고 디버깅도 쉽습니다.
 *
 * <p><b>타임아웃은 반드시 있어야 합니다.</b> 시연 중 무한 대기가 최악입니다.
 */
@Component
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "openai")
public class OpenAiClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiClient.class);
    private static final String BASE_URL = "https://api.openai.com/v1";

    private final RestClient client;
    private final String chatModel;
    private final int maxOutputTokens;

    public OpenAiClient(
            @Value("${app.ai.openai.api-key:}") String apiKey,
            @Value("${app.ai.openai.chat-model:gpt-4o-mini}") String chatModel,
            @Value("${app.ai.openai.max-output-tokens:400}") int maxOutputTokens,
            @Value("${app.ai.openai.timeout-seconds:10}") int timeoutSeconds) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "app.ai.provider=openai 인데 OPENAI_API_KEY 가 비어 있습니다. "
                            + "BE/.env 를 확인하세요 (BE/.env.example 참고).");
        }

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));

        this.client = RestClient.builder()
                .baseUrl(BASE_URL)
                .requestFactory(factory)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();

        this.chatModel = chatModel;
        this.maxOutputTokens = maxOutputTokens;
    }

    /**
     * 대화 완성. {@code jsonMode} 가 true 면 응답이 JSON 객체임을 보장받습니다.
     *
     * <p>시스템 프롬프트를 <b>앞에</b> 두는 것이 중요합니다 — OpenAI 는 1024토큰 이상
     * 프롬프트의 공통 접두사를 자동 캐싱하므로, 고정 부분이 앞에 있어야 입력 비용이 줄어듭니다.
     */
    public String chat(String systemPrompt, String userPrompt, boolean jsonMode) {
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("model", chatModel);
        body.put("max_tokens", maxOutputTokens);
        body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)));
        if (jsonMode) {
            body.put("response_format", Map.of("type", "json_object"));
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = client.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            return extractContent(response);

        } catch (RuntimeException e) {
            log.warn("OpenAI chat 호출 실패: {}", e.getMessage());
            throw new ApiException(ErrorCode.AI_PROVIDER_UNAVAILABLE, "AI 응답 생성에 실패했습니다.");
        }
    }

    @SuppressWarnings("unchecked")
    private static String extractContent(Map<String, Object> response) {
        List<Map<String, Object>> choices =
                (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new ApiException(ErrorCode.AI_PROVIDER_UNAVAILABLE, "AI 응답이 비어 있습니다.");
        }
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String content = (String) message.get("content");
        if (content == null || content.isBlank()) {
            throw new ApiException(ErrorCode.AI_PROVIDER_UNAVAILABLE, "AI 응답이 비어 있습니다.");
        }
        return content;
    }

    // 음성 합성(TTS)과 음성 인식(STT)은 여기 없습니다.
    // 브라우저 내장 Web Speech API 로 처리하므로 서버 호출도, 비용도 없습니다
    // (docs/ai-stack.md §2~3). 되돌리려면 /audio/speech, /audio/transcriptions 를 추가하세요.
}
