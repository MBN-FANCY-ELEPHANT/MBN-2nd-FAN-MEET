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

    /** ⚠️ FEATURE 근거는 DB 리소스가 아니라 화면이라 id 가 없습니다 (nullable). */
    @Column(name = "citation_target_id")
    private Long targetId;

    @Column(name = "citation_title", nullable = false, length = 200)
    private String title;

    /** FE 라우트. 주어지면 FE 가 type/id 로 유추하지 않고 이 값으로 이동합니다. */
    @Column(name = "citation_route", length = 200)
    private String route;

    protected ChatCitation() {
        // JPA
    }

    private ChatCitation(CitationType type, Long targetId, String title, String route) {
        this.type = type;
        this.targetId = targetId;
        this.title = title;
        this.route = route;
    }

    public static ChatCitation of(CitationType type, Long targetId, String title, String route) {
        return new ChatCitation(type, targetId, title, route);
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

    public String getRoute() {
        return route;
    }
}
