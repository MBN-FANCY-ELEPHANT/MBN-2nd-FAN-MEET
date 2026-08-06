package kr.co.mbn.trot.chat.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

/**
 * 대화 메시지.
 *
 * <p>{@code citations} 는 답변 근거로 사용한 내부 리소스입니다. FE 는 이를 카드로 렌더하고
 * 탭하면 해당 화면으로 딥링크합니다 — 골든 패스 ②의 핵심 동작입니다.
 */
@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, length = 36)
    private String sessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageRole role;

    @Column(nullable = false, length = 2000)
    private String content;

    /** 답변 범위 밖이라 거절한 경우 true. FE 는 이때 근거 카드를 그리지 않습니다. */
    @Column(name = "out_of_scope", nullable = false)
    private boolean outOfScope;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "chat_message_citation", joinColumns = @JoinColumn(name = "message_id"))
    @OrderColumn(name = "sort_order")
    private List<ChatCitation> citations = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ChatMessage() {
        // JPA
    }

    private ChatMessage(
            String sessionId,
            MessageRole role,
            String content,
            boolean outOfScope,
            List<ChatCitation> citations) {
        this.sessionId = sessionId;
        this.role = role;
        this.content = content;
        this.outOfScope = outOfScope;
        this.citations = new ArrayList<>(citations);
        this.createdAt = Instant.now();
    }

    public static ChatMessage ofUser(String sessionId, String content) {
        return new ChatMessage(sessionId, MessageRole.USER, content, false, List.of());
    }

    public static ChatMessage ofAssistant(
            String sessionId, String content, boolean outOfScope, List<ChatCitation> citations) {
        return new ChatMessage(sessionId, MessageRole.ASSISTANT, content, outOfScope, citations);
    }

    public Long getId() {
        return id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public MessageRole getRole() {
        return role;
    }

    public String getContent() {
        return content;
    }

    public boolean isOutOfScope() {
        return outOfScope;
    }

    public List<ChatCitation> getCitations() {
        return List.copyOf(citations);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
