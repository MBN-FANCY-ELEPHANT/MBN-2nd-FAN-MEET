package kr.co.mbn.trot.ai.provider;

import java.util.List;

/** 디자인의 AI 분석 패널 구조 — 요약 문장 1개 + {제목, 내용} 항목 반복. */
public record AiAnalysisResult(
        String summary,
        List<Item> items
) {

    public record Item(String title, String body) {
    }
}
