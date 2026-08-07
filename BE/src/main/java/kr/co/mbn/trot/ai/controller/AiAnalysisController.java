package kr.co.mbn.trot.ai.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.ai.dto.AiAnalysisResponse;
import kr.co.mbn.trot.ai.dto.NewsDigestResponse;
import kr.co.mbn.trot.ai.service.AiAnalysisService;
import kr.co.mbn.trot.ai.service.NewsDigestService;
import kr.co.mbn.trot.user.domain.Locale;

@RestController
@RequestMapping("/api/v1")
public class AiAnalysisController {

    private final AiAnalysisService analysisService;
    private final NewsDigestService newsDigestService;

    public AiAnalysisController(
            AiAnalysisService analysisService,
            NewsDigestService newsDigestService) {
        this.analysisService = analysisService;
        this.newsDigestService = newsDigestService;
    }

    @GetMapping("/contents/{id}/ai-analysis")
    public AiAnalysisResponse getAnalysis(
            @PathVariable Long id,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage) {

        return analysisService.getAnalysis(id, Locale.fromTagOrDefault(acceptLanguage));
    }

    /** 소식 스레드 상단의 AI 소식 요약. 결과는 (starId, locale) 단위로 캐시됩니다. */
    @GetMapping("/stars/{starId}/news-digest")
    public NewsDigestResponse getNewsDigest(
            @PathVariable Long starId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage) {

        return newsDigestService.getDigest(starId, Locale.fromTagOrDefault(acceptLanguage));
    }

    /** 시연 중 "지금 다시 분석해 볼까요?" 를 가능하게 하는 관리자 엔드포인트입니다. */
    @PostMapping("/admin/ai-analysis/regenerate")
    public AiAnalysisResponse regenerate(
            @RequestParam Long contentId,
            @RequestParam(required = false) Locale locale) {

        return analysisService.generate(contentId, locale == null ? Locale.KO : locale);
    }
}
