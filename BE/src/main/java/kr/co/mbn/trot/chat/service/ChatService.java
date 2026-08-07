package kr.co.mbn.trot.chat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.ai.provider.AiProvider;
import kr.co.mbn.trot.ai.provider.ChatAnswer;
import kr.co.mbn.trot.ai.provider.ChatQuestion;
import kr.co.mbn.trot.ai.provider.Evidence;
import kr.co.mbn.trot.ai.provider.Intent;
import kr.co.mbn.trot.chat.domain.ChatCitation;
import kr.co.mbn.trot.chat.domain.ChatMessage;
import kr.co.mbn.trot.chat.domain.ChatSession;
import kr.co.mbn.trot.chat.dto.ChatActionResponse;
import kr.co.mbn.trot.chat.dto.ChatMessageResponse;
import kr.co.mbn.trot.chat.dto.ChatSessionResponse;
import kr.co.mbn.trot.chat.repository.ChatMessageRepository;
import kr.co.mbn.trot.chat.repository.ChatSessionRepository;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.star.repository.StarRepository;
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

    // ⚠️ 특정 아티스트 이름을 넣지 않습니다. 시드 스타가 3명이라 한 명을 예시로 박으면
    //    나머지 두 명을 고른 사용자에게 남의 이름이 추천 질문으로 뜹니다.
    private static final List<String> SUGGESTED_KO = List.of(
            "이번 주 출연 방송 알려줘",
            "참여할 수 있는 팬 모임 있어?",
            "최근 무대 영상 추천해줘");

    private static final List<String> SUGGESTED_EN = List.of(
            "What broadcasts are on this week?",
            "Are there any fan gatherings I can join?",
            "Recommend a recent stage video");

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final EvidenceFinder evidenceFinder;
    private final VoiceActionResolver actionResolver;
    private final AiProvider aiProvider;
    private final CurrentUserProvider currentUser;
    private final StarRepository starRepository;

    public ChatService(
            ChatSessionRepository sessionRepository,
            ChatMessageRepository messageRepository,
            EvidenceFinder evidenceFinder,
            VoiceActionResolver actionResolver,
            AiProvider aiProvider,
            StarRepository starRepository,
            CurrentUserProvider currentUser) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.evidenceFinder = evidenceFinder;
        this.actionResolver = actionResolver;
        this.aiProvider = aiProvider;
        this.currentUser = currentUser;
        this.starRepository = starRepository;
    }

    @Transactional
    public ChatSessionResponse createSession(
            Long starId, Locale locale, String artistName, Long gatheringId) {
        Locale resolved = locale == null ? Locale.KO : locale;

        ChatSession session = sessionRepository.save(
                ChatSession.open(
                        currentUser.findUserId().orElse(null),
                        starId, resolved, artistName, gatheringId));

        return new ChatSessionResponse(
                session.getId(),
                resolved == Locale.KO ? SUGGESTED_KO : SUGGESTED_EN);
    }

    /**
     * 질문에 답합니다.
     *
     * <p>순서가 중요합니다: <b>행동 요청 판정 → 의도 분류 → 스코프 판정 → 근거 조회 → AI 호출</b>.
     * 범위 밖이면 근거 조회도 AI 호출도 하지 않으므로 비용과 지연이 0 입니다.
     *
     * <p><b>행동 요청이면 LLM 을 호출하지 않습니다.</b> "응모해줘" 에 대한 답은 창작할 것이
     * 없고, 확인 문구를 모델에게 맡기면 (a) 3~8초를 기다려야 하고 (b) 실행하지도 않은 일을
     * 했다고 말할 위험이 있습니다. 실행 결과만 내려보내고 문장은 FE 가 만듭니다.
     *
     * <p>⚠️ <b>이 메서드는 의도적으로 트랜잭션을 갖지 않습니다.</b>
     * {@code VoiceActionResolver} 안에서 모임 신청이 {@code GATHERING_FULL} 로 실패하면
     * 그 예외를 잡아도 <b>공용 트랜잭션이 rollback-only 로 마킹</b>돼 대화 저장까지 통째로
     * 실패합니다. 쓰기는 각 도메인 서비스가 자기 트랜잭션 안에서 처리합니다.
     *
     * @param userId 요청 스레드에서 읽어 넘긴 사용자 ID. SSE 응답은 <b>다른 스레드</b>에서
     *     만들어지고 {@code SecurityContextHolder} 는 ThreadLocal 이라, 여기서 다시 조회하면
     *     항상 비로그인으로 보입니다.
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public ChatMessageResponse ask(String sessionId, String question, Long userId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.CHAT_SESSION_NOT_FOUND));

        messageRepository.save(ChatMessage.ofUser(sessionId, question));

        Long actor = userId != null ? userId : session.getUserId();
        ChatActionResponse action = actionResolver.resolveAndRun(
                question, session.getStarId(), session.getArtistName(), actor);

        if (action != null) {
            ChatMessage saved = messageRepository.save(ChatMessage.ofAssistant(
                    sessionId, describe(action), false, List.of()));
            return ChatMessageResponse.from(saved, action);
        }

        // 모집 대화방 세션은 **그 방 안의 질문**이라는 전제가 있습니다. 도메인 단어가 없어도
        // ("몇 시까지 가면 되나요?") 모임 질문으로 받고, 금지 주제만 거절합니다.
        Long roomId = session.getGatheringId();
        Intent intent = (roomId != null)
                ? (evidenceFinder.isBlocked(question) ? Intent.OUT_OF_SCOPE : Intent.GATHERING)
                : evidenceFinder.classify(question);
        boolean inScope = intent != Intent.OUT_OF_SCOPE;

        List<Evidence> found = new java.util.ArrayList<>();
        // 그 방의 모임을 **맨 앞에** 둡니다 — citations 는 앞 3건만 나가고, LLM 도 앞쪽을
        // 먼저 읽습니다. 뒤에 두면 같은 스타의 다른 모임을 안내하게 됩니다.
        if (roomId != null && inScope) {
            evidenceFinder.gatheringEvidence(roomId).ifPresent(found::add);
        }
        found.addAll(evidenceFinder.find(intent, session.getStarId(), question));

        // 시드 스타가 3명이 되면서 이름 치환 shim(rewriteArtist)을 걷어냈습니다.
        // 근거는 session.starId 로 조회한 그 아티스트의 진짜 데이터입니다.
        ChatAnswer answer = aiProvider.answer(
                new ChatQuestion(
                        question, session.getLocale(), intent, inScope, found,
                        session.getArtistName()));

        List<ChatCitation> citations = answer.citations().stream()
                .map(e -> ChatCitation.of(e.type(), e.id(), e.title(), e.route()))
                .toList();

        ChatMessage saved = messageRepository.save(ChatMessage.ofAssistant(
                sessionId, answer.text(), answer.outOfScope(), citations));

        return ChatMessageResponse.from(saved);
    }

    /**
     * 액션 턴의 <b>대화 기록용</b> 한 줄.
     *
     * <p>⚠️ 사용자에게 보이는 문구가 아닙니다. 화면·음성에 나가는 확인 문장은 FE 가
     * {@code voice.action.*} 키로 7개 언어에서 만듭니다 (docs/api-spec.yaml ChatAction).
     * 여기에 번역을 늘리면 i18n 이 두 군데로 갈라집니다.
     */
    private static String describe(ChatActionResponse action) {
        return "[%s/%s] %s".formatted(
                action.type(), action.status(),
                action.targetTitle() == null ? "-" : action.targetTitle());
    }
}
