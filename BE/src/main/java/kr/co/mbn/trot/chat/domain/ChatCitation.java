package kr.co.mbn.trot.chat.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import kr.co.mbn.trot.ai.provider.CitationType;

/** 답변 근거 1건. FE 의 딥링크 카드에 대응합니다. */
@Embeddable
public class ChatCitation {

    @Enumerated(EnumType.STRING)
    @Column(name = "citation_type", nullable = false, length = 20)
    private CitationType type;

    @Column(name = "citation_target_id", nullable = false)
    private Long targetId;

    @Column(name = "citation_title", nullable = false, length = 200)
    private String title;

    protected ChatCitation() {
        // JPA
    }

    private ChatCitation(CitationType type, Long targetId, String title) {
        this.type = type;
        this.targetId = targetId;
        this.title = title;
    }

    public static ChatCitation of(CitationType type, Long targetId, String title) {
        return new ChatCitation(type, targetId, title);
    }

    public CitationType getType() {
        return type;
    }

    public Long getTargetId() {
        return targetId;
    }

    public String getTitle() {
        return title;
    }
}
