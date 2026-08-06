package kr.co.mbn.trot.ai.domain;

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
import jakarta.persistence.UniqueConstraint;
import kr.co.mbn.trot.user.domain.Locale;

/**
 * 기사·영상의 AI 분석 결과.
 *
 * <p><b>사전 생성 + DB 캐싱입니다.</b> 상세 화면을 열 때마다 LLM 을 호출하면 3~8초를 기다리고,
 * 네트워크가 흔들리면 화면이 아예 안 뜹니다. 심사 시연에서 치명적이라 조회는 DB 에서만 합니다
 * (docs/ai-stack.md §4).
 *
 * <p>{@code items} 는 JSON 대신 {@code @ElementCollection} 으로 저장합니다 —
 * H2/PostgreSQL 양쪽에서 동일하게 동작하고 파싱 코드가 필요 없습니다.
 */
@Entity
@Table(name = "ai_analysis",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_ai_analysis_content_locale", columnNames = {"content_id", "locale"}))
public class AiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Locale locale;

    @Column(nullable = false, length = 500)
    private String summary;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "ai_analysis_item",
            joinColumns = @JoinColumn(name = "analysis_id"))
    @OrderColumn(name = "sort_order")
    private List<AiAnalysisItem> items = new ArrayList<>();

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    protected AiAnalysis() {
        // JPA
    }

    private AiAnalysis(Long contentId, Locale locale, String summary, List<AiAnalysisItem> items) {
        this.contentId = contentId;
        this.locale = locale;
        this.summary = summary;
        this.items = new ArrayList<>(items);
        this.generatedAt = Instant.now();
    }

    public static AiAnalysis of(
            Long contentId, Locale locale, String summary, List<AiAnalysisItem> items) {
        return new AiAnalysis(contentId, locale, summary, items);
    }

    /** 재생성 시 기존 행을 갱신합니다 (UNIQUE 제약 때문에 새로 넣을 수 없습니다). */
    public void replaceWith(String summary, List<AiAnalysisItem> items) {
        this.summary = summary;
        this.items.clear();
        this.items.addAll(items);
        this.generatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getContentId() {
        return contentId;
    }

    public Locale getLocale() {
        return locale;
    }

    public String getSummary() {
        return summary;
    }

    public List<AiAnalysisItem> getItems() {
        return List.copyOf(items);
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }
}
