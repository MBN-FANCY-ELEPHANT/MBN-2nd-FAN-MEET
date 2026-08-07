package kr.co.mbn.trot.chat.controller;

import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.annotation.PreDestroy;
import jakarta.validation.Valid;
import kr.co.mbn.trot.chat.dto.ChatMessageRequest;
import kr.co.mbn.trot.chat.dto.ChatMessageResponse;
import kr.co.mbn.trot.chat.dto.ChatSessionCreateRequest;
import kr.co.mbn.trot.chat.dto.ChatSessionResponse;
import kr.co.mbn.trot.chat.service.ChatService;
import kr.co.mbn.trot.common.error.ApiException;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    /** 타이핑 효과용 청크 크기와 간격. 데모 임팩트를 만드는 값이라 너무 크게 잡지 마세요. */
    private static final int CHUNK_CHARS = 12;
    private static final long CHUNK_DELAY_MS = 45;
    private static final long SSE_TIMEOUT_MS = 30_000;

    private final ChatService chatService;
    private final ExecutorService streamExecutor = Executors.newCachedThreadPool();

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PreDestroy
    void shutdown() {
        streamExecutor.shutdown();
    }

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public ChatSessionResponse createSession(@Valid @RequestBody ChatSessionCreateRequest request) {
        return chatService.createSession(
                request.starId(), request.locale(), request.artistName());
    }

    /** 한 번에 완성된 답변을 받습니다. 테스트와 폴백 경로용. */
    @PostMapping(
            value = "/sessions/{sessionId}/messages",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ChatMessageResponse ask(
            @PathVariable String sessionId, @Valid @RequestBody ChatMessageRequest request) {

        return chatService.ask(sessionId, request.content());
    }

    /**
     * 토큰 단위 스트리밍. 음성 오버레이 4단계(결과)의 타이핑 효과를 만듭니다.
     *
     * <p>이벤트 형식은 docs/api-spec.yaml 과 일치시켜야 합니다:
     * {@code delta} → {@code citations} → {@code done}, 실패 시 {@code error}.
     *
     * <p>답변 생성 자체는 동기이고 <b>전송만 청크로 쪼갭니다.</b> 실제 LLM 스트리밍으로
     * 교체해도 이벤트 형식은 그대로라 FE 는 수정할 필요가 없습니다.
     */
    @PostMapping(
            value = "/sessions/{sessionId}/messages",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter askStreaming(
            @PathVariable String sessionId, @Valid @RequestBody ChatMessageRequest request) {

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        streamExecutor.execute(() -> {
            try {
                ChatMessageResponse answer = chatService.ask(sessionId, request.content());

                String text = answer.content();
                for (int i = 0; i < text.length(); i += CHUNK_CHARS) {
                    String chunk = text.substring(i, Math.min(i + CHUNK_CHARS, text.length()));
                    emitter.send(SseEmitter.event().name("delta").data(Map.of("text", chunk)));
                    Thread.sleep(CHUNK_DELAY_MS);
                }

                if (!answer.citations().isEmpty()) {
                    emitter.send(SseEmitter.event()
                            .name("citations")
                            .data(Map.of("citations", answer.citations())));
                }

                emitter.send(SseEmitter.event().name("done").data(Map.of("messageId", answer.id())));
                emitter.complete();

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                emitter.completeWithError(e);
            } catch (Exception e) {
                // 데모 중 무한 대기가 최악입니다. 실패는 즉시 알리고 스트림을 닫습니다.
                log.warn("챗봇 스트리밍 실패 (sessionId={}): {}", sessionId, e.getMessage());
                sendErrorAndClose(emitter, e);
            }
        });

        return emitter;
    }

    private static void sendErrorAndClose(SseEmitter emitter, Exception e) {
        String code = (e instanceof ApiException api)
                ? api.errorCode().name()
                : "INTERNAL_ERROR";
        try {
            emitter.send(SseEmitter.event()
                    .name("error")
                    .data(Map.of("code", code, "message", String.valueOf(e.getMessage()))));
            emitter.complete();
        } catch (Exception sendFailure) {
            emitter.completeWithError(sendFailure);
        }
    }
}
