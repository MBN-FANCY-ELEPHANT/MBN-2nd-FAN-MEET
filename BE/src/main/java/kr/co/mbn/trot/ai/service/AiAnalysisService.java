package kr.co.mbn.trot.ai.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.ai.domain.AiAnalysis;
import kr.co.mbn.trot.ai.domain.AiAnalysisItem;
import kr.co.mbn.trot.ai.dto.AiAnalysisResponse;
import kr.co.mbn.trot.ai.provider.AiAnalysisRequest;
import kr.co.mbn.trot.ai.provider.AiAnalysisResult;
import kr.co.mbn.trot.ai.provider.AiProvider;
import kr.co.mbn.trot.ai.repository.AiAnalysisRepository;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.content.domain.Content;
import kr.co.mbn.trot.content.repository.ContentRepository;
import kr.co.mbn.trot.user.domain.Locale;

/**
 * AI 분석 조회 · 생성.
 *
 * <p><b>조회는 DB 만 봅니다.</b> LLM 호출은 {@link #generate} 에서만 일어나며, 이는 기동 시
 * 워밍업({@code AiAnalysisWarmup})이나 관리자 재생성에서 호출됩니다.
 */
@Service
@Transactional(readOnly = true)
public class AiAnalysisService {

    private final AiAnalysisRepository analysisRepository;
    private final ContentRepository contentRepository;
    private final AiProvider aiProvider;

    public AiAnalysisService(
            AiAnalysisRepository analysisRepository,
            ContentRepository contentRepository,
            AiProvider aiProvider) {
        this.analysisRepository = analysisRepository;
        this.contentRepository = contentRepository;
        this.aiProvider = aiProvider;
    }

    /**
     * 해당 언어의 분석을 반환합니다. 없으면 KO 로 폴백합니다.
     * KO 조차 없으면 404 — 아직 생성되지 않은 콘텐츠입니다.
     */
    public AiAnalysisResponse getAnalysis(Long contentId, Locale locale) {
        return analysisRepository.findByContentIdAndLocale(contentId, locale)
                .or(() -> analysisRepository.findByContentIdAndLocale(contentId, Locale.KO))
                .map(AiAnalysisResponse::from)
                .orElseThrow(() -> new ApiException(ErrorCode.AI_ANALYSIS_NOT_FOUND));
    }

    /** 이미 있으면 건너뜁니다. 워밍업에서 사용합니다. */
    @Transactional
    public void generateIfAbsent(Long contentId, Locale locale) {
        if (!analysisRepository.existsByContentIdAndLocale(contentId, locale)) {
            generate(contentId, locale);
        }
    }

    /** 강제 재생성. 기존 행이 있으면 갱신합니다 (UNIQUE 제약). */
    @Transactional
    public AiAnalysisResponse generate(Long contentId, Locale locale) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ApiException(ErrorCode.CONTENT_NOT_FOUND));

        AiAnalysisResult result = aiProvider.analyze(new AiAnalysisRequest(
                content.getTitle(),
                content.getBody(),
                content.getType().name(),
                locale));

        List<AiAnalysisItem> items = result.items().stream()
                .map(i -> AiAnalysisItem.of(i.title(), i.body()))
                .toList();

        Optional<AiAnalysis> existing = analysisRepository.findByContentIdAndLocale(contentId, locale);
        AiAnalysis analysis = existing
                .map(a -> {
                    a.replaceWith(result.summary(), items);
                    return a;
                })
                .orElseGet(() -> analysisRepository.save(
                        AiAnalysis.of(contentId, locale, result.summary(), items)));

        return AiAnalysisResponse.from(analysis);
    }
}
