package kr.co.mbn.trot.ai.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.ai.dto.NewsDigestResponse;
import kr.co.mbn.trot.ai.provider.AiAnalysisRequest;
import kr.co.mbn.trot.ai.provider.AiAnalysisResult;
import kr.co.mbn.trot.ai.provider.AiProvider;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.content.domain.Content;
import kr.co.mbn.trot.content.repository.ContentRepository;
import kr.co.mbn.trot.star.repository.StarRepository;
import kr.co.mbn.trot.user.domain.Locale;

/**
 * 소식 스레드의 <b>AI 소식 요약</b>.
 *
 * <p>기사·영상은 이미 {@code AiAnalysisService} 가 <i>한 건씩</i> 분석합니다. 여기서는
 * 최근 콘텐츠를 <b>한 덩어리로 묶어</b> "이번 주에 무슨 일이 있었는지"를 한 번에 말해 줍니다.
 * 소식 탭을 연 사람이 카드 열 개를 읽지 않고도 흐름을 알 수 있어야 하기 때문입니다.
 *
 * <p><b>캐시가 핵심입니다.</b> 소식 탭은 자주 열리는데 매번 LLM 을 부르면 느리고 비쌉니다.
 * {@code (starId, locale)} 단위로 메모리에 담아 두고 캐시가 비었을 때만 호출합니다.
 * 서버를 재시작하면 첫 요청만 느립니다 — FE 는 그 사이 스켈레톤을 띄웁니다.
 *
 * <p>⚠️ 스타 본인을 사칭하지 않습니다. 작성 주체는 AI 도우미 "비엔이" 이고, 내용은
 * MBN 콘텐츠에서 나온 것만 담습니다 (기획서 5-2).
 */
@Service
@Transactional(readOnly = true)
public class NewsDigestService {

    /** 요약에 넣을 최근 콘텐츠 수. 늘리면 프롬프트가 길어지고 요약이 흐려집니다. */
    private static final int SOURCE_LIMIT = 6;

    /** 본문은 앞부분만 넣습니다. 전문을 다 넣어도 요약 품질이 오르지 않습니다. */
    private static final int BODY_CHARS = 400;

    private final ContentRepository contentRepository;
    private final StarRepository starRepository;
    private final AiProvider aiProvider;

    private final Map<String, NewsDigestResponse> cache = new ConcurrentHashMap<>();

    public NewsDigestService(
            ContentRepository contentRepository,
            StarRepository starRepository,
            AiProvider aiProvider) {
        this.contentRepository = contentRepository;
        this.starRepository = starRepository;
        this.aiProvider = aiProvider;
    }

    public NewsDigestResponse getDigest(Long starId, Locale locale) {
        return cache.computeIfAbsent(starId + ":" + locale.name(), key -> generate(starId, locale));
    }

    private NewsDigestResponse generate(Long starId, Locale locale) {
        String starName = starRepository.findById(starId)
                .map(star -> star.getName())
                .orElseThrow(() -> new ApiException(ErrorCode.STAR_NOT_FOUND));

        List<Content> sources = contentRepository.findTop10ByStarIdOrderByPublishedAtDesc(starId)
                .stream()
                .limit(SOURCE_LIMIT)
                .toList();

        if (sources.isEmpty()) {
            throw new ApiException(ErrorCode.AI_ANALYSIS_NOT_FOUND);
        }

        AiAnalysisResult result = aiProvider.analyze(new AiAnalysisRequest(
                starName + " 최근 소식 모아보기",
                buildCorpus(sources),
                // kind 는 프롬프트에서 "무엇을 요약하는지" 구분에만 쓰입니다.
                "NEWS_DIGEST",
                locale));

        return new NewsDigestResponse(
                starId,
                locale,
                result.summary(),
                result.items().stream()
                        .map(i -> new NewsDigestResponse.Item(i.title(), i.body()))
                        .toList(),
                sources.stream()
                        .map(c -> new NewsDigestResponse.Source(c.getId(), c.getTitle(), c.getType()))
                        .toList(),
                Instant.now());
    }

    /** 콘텐츠 여러 건을 하나의 텍스트로 붙입니다. 제목만 있는 영상도 그대로 넣습니다. */
    private String buildCorpus(List<Content> sources) {
        StringBuilder sb = new StringBuilder();
        for (Content content : sources) {
            sb.append("- [").append(content.getType().name()).append("] ")
                    .append(content.getTitle()).append('\n');
            String body = content.getBody();
            if (body != null && !body.isBlank()) {
                sb.append("  ")
                        .append(body.length() > BODY_CHARS ? body.substring(0, BODY_CHARS) : body)
                        .append('\n');
            }
        }
        return sb.toString();
    }
}
