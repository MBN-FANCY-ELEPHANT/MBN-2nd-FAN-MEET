package kr.co.mbn.trot.ai.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import kr.co.mbn.trot.ai.provider.AiProvider;
import kr.co.mbn.trot.content.repository.ContentRepository;
import kr.co.mbn.trot.user.domain.Locale;

/**
 * 기동 시 분석이 없는 콘텐츠를 채웁니다 — "사전 생성"의 실체입니다.
 *
 * <p>이 클래스 덕분에 상세 화면 조회는 항상 DB 읽기 한 번으로 끝납니다.
 * OpenAI 로 교체해도 코드는 그대로이고, 기동이 조금 느려질 뿐입니다.
 *
 * <p>KO/EN 두 언어만 미리 만듭니다. 나머지 언어는 조회 시 KO 로 폴백합니다
 * (docs/mvp-scope.md — 번역 검수는 ko/en 만).
 */
@Component
public class AiAnalysisWarmup implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AiAnalysisWarmup.class);
    private static final List<Locale> PREGENERATED = List.of(Locale.KO, Locale.EN);

    private final ContentRepository contentRepository;
    private final AiAnalysisService analysisService;
    private final AiProvider aiProvider;

    public AiAnalysisWarmup(
            ContentRepository contentRepository,
            AiAnalysisService analysisService,
            AiProvider aiProvider) {
        this.contentRepository = contentRepository;
        this.analysisService = analysisService;
        this.aiProvider = aiProvider;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<Long> contentIds = contentRepository.findAll().stream()
                .map(c -> c.getId())
                .toList();

        boolean live = aiProvider.isLive();
        log.info("AI 분석 워밍업 시작 — 콘텐츠 {}건 × 언어 {}개, provider={}",
                contentIds.size(), PREGENERATED.size(), live ? "live" : "stub");

        if (!live) {
            // 스텁은 즉시 끝나므로 굳이 스레드를 띄우지 않습니다.
            generateAll(contentIds);
            return;
        }

        // 실제 LLM 이면 콘텐츠당 1~3초가 걸려 기동이 1분 가까이 늦어집니다.
        // 백그라운드로 돌려 앱은 즉시 뜨게 하고, 분석은 뒤따라 채워집니다.
        // 아직 생성되지 않은 콘텐츠를 열면 404 → FE 가 "AI 분석 준비 중"을 보여줍니다.
        Thread worker = new Thread(() -> generateAll(contentIds), "ai-warmup");
        worker.setDaemon(true); // 종료를 막지 않도록
        worker.start();
    }

    private void generateAll(List<Long> contentIds) {
        long startedAt = System.currentTimeMillis();
        int generated = 0;

        for (Long contentId : contentIds) {
            for (Locale locale : PREGENERATED) {
                try {
                    analysisService.generateIfAbsent(contentId, locale);
                    generated++;
                } catch (RuntimeException e) {
                    // 한 건이 실패해도 나머지를 계속합니다. 해당 콘텐츠만 분석 없이 뜹니다.
                    log.warn("AI 분석 생성 실패 (contentId={}, locale={}): {}",
                            contentId, locale, e.getMessage());
                }
            }
        }

        log.info("AI 분석 워밍업 완료 — {}건 생성, {}ms 소요",
                generated, System.currentTimeMillis() - startedAt);
    }
}
