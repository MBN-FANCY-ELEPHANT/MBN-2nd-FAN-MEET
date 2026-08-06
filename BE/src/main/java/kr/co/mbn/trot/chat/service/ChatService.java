package kr.co.mbn.trot.chat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.ai.provider.AiProvider;
import kr.co.mbn.trot.ai.provider.ChatAnswer;
import kr.co.mbn.trot.ai.provider.ChatQuestion;
import kr.co.mbn.trot.ai.provider.Evidence;
import kr.co.mbn.trot.ai.provider.Intent;
import kr.co.mbn.trot.chat.domain.ChatCitation;
import kr.co.mbn.trot.chat.domain.ChatMessage;
import kr.co.mbn.trot.chat.domain.ChatSession;
import kr.co.mbn.trot.chat.dto.ChatMessageResponse;
import kr.co.mbn.trot.chat.dto.ChatSessionResponse;
import kr.co.mbn.trot.chat.repository.ChatMessageRepository;
import kr.co.mbn.trot.chat.repository.ChatSessionRepository;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.user.domain.Locale;

/**
 * AI 도우미 "비엔이".
 *
 * <p><b>정책 (협상 대상 아님)</b>
 * <ul>
 *   <li>자신을 "MBN AI 도우미 비엔이"로 소개하며 <b>스타 본인을 사칭하지 않습니다.</b></li>
 *   <li>답변 범위를 MBN 방송·트롯 아티스트·플랫폼 데이터로 제한합니다.
 *       범위 밖이면 {@code outOfScope=true} 로 응답하고 LLM 을 호출하지 않습니다.</li>
 *   <li>DB 에 근거가 없으면 지어내지 않고 모른다고 답합니다.</li>
 * </ul>
 */
@Service
@Transactional(readOnly = true)
public class ChatService {

    private static final List<String> SUGGESTED_KO = List.of(
            "이번 주 임영웅 출연 방송 알려줘",
            "참여할 수 있는 팬 모임 있어?",
            "최근 무대 영상 추천해줘");

    private static final List<String> SUGGESTED_EN = List.of(
            "What broadcasts is Lim Young-woong on this week?",
            "Are there any fan gatherings I can join?",
            "Recommend a recent stage video");

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final EvidenceFinder evidenceFinder;
    private final AiProvider aiProvider;
    private final CurrentUserProvider currentUser;

    public ChatService(
            ChatSessionRepository sessionRepository,
            ChatMessageRepository messageRepository,
            EvidenceFinder evidenceFinder,
            AiProvider aiProvider,
            CurrentUserProvider currentUser) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.evidenceFinder = evidenceFinder;
        this.aiProvider = aiProvider;
        this.currentUser = currentUser;
    }

    @Transactional
    public ChatSessionResponse createSession(Long starId, Locale locale) {
        Locale resolved = locale == null ? Locale.KO : locale;

        ChatSession session = sessionRepository.save(
                ChatSession.open(currentUser.findUserId().orElse(null), starId, resolved));

        return new ChatSessionResponse(
                session.getId(),
                resolved == Locale.KO ? SUGGESTED_KO : SUGGESTED_EN);
    }

    /**
     * 질문에 답합니다.
     *
     * <p>순서가 중요합니다: <b>의도 분류 → 스코프 판정 → 근거 조회 → AI 호출</b>.
     * 범위 밖이면 근거 조회도 AI 호출도 하지 않으므로 비용과 지연이 0 입니다.
     */
    @Transactional
    public ChatMessageResponse ask(String sessionId, String question) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.CHAT_SESSION_NOT_FOUND));

        messageRepository.save(ChatMessage.ofUser(sessionId, question));

        Intent intent = evidenceFinder.classify(question);
        boolean inScope = intent != Intent.OUT_OF_SCOPE;
        List<Evidence> evidence = evidenceFinder.find(intent, session.getStarId());

        ChatAnswer answer = aiProvider.answer(
                new ChatQuestion(question, session.getLocale(), intent, inScope, evidence));

        List<ChatCitation> citations = answer.citations().stream()
                .map(e -> ChatCitation.of(e.type(), e.id(), e.title()))
                .toList();

        ChatMessage saved = messageRepository.save(ChatMessage.ofAssistant(
                sessionId, answer.text(), answer.outOfScope(), citations));

        return ChatMessageResponse.from(saved);
    }

    public List<ChatMessageResponse> getMessages(String sessionId) {
        if (!sessionRepository.existsById(sessionId)) {
            throw new ApiException(ErrorCode.CHAT_SESSION_NOT_FOUND);
        }
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(ChatMessageResponse::from)
                .toList();
    }
}
