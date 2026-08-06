package kr.co.mbn.trot.ai.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** AI 분석 패널의 {제목, 내용} 항목 한 줄. */
@Embeddable
public class AiAnalysisItem {

    @Column(name = "item_title", nullable = false, length = 100)
    private String title;

    @Column(name = "item_body", nullable = false, length = 1000)
    private String body;

    protected AiAnalysisItem() {
        // JPA
    }

    private AiAnalysisItem(String title, String body) {
        this.title = title;
        this.body = body;
    }

    public static AiAnalysisItem of(String title, String body) {
        return new AiAnalysisItem(title, body);
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }
}
