package kr.co.mbn.trot.chat.service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import kr.co.mbn.trot.ai.provider.CitationType;
import kr.co.mbn.trot.ai.provider.Evidence;
import kr.co.mbn.trot.ai.provider.Intent;
import kr.co.mbn.trot.content.repository.ContentRepository;
import kr.co.mbn.trot.gathering.domain.GatheringStatus;
import kr.co.mbn.trot.gathering.repository.GatheringRepository;
import kr.co.mbn.trot.place.repository.PlaceRepository;
import kr.co.mbn.trot.schedule.repository.ScheduleRepository;
import kr.co.mbn.trot.tip.repository.TipRepository;

/**
 * 질문 의도를 분류하고 플랫폼 DB 에서 근거를 모읍니다.
 *
 * <p><b>벡터 DB 를 쓰지 않습니다.</b> 데이터가 30~50건 수준이라 관련 후보를 전부 컨텍스트에
 * 넣는 편이 정확하고 빠르며 디버깅도 쉽습니다 (docs/ai-stack.md §5).
 *
 * <p>의도 분류에도 LLM 을 쓰지 않습니다. 도메인이 좁아 키워드 매칭으로 충분하고,
 * 왕복이 한 번 줄어 응답이 빨라집니다.
 *
 * <p><b>스코프 제한</b>은 여기서 결정됩니다 — MBN 방송·트롯 아티스트·플랫폼 데이터를
 * 벗어난 질문은 {@link Intent#OUT_OF_SCOPE} 로 분류되어 LLM 호출 자체가 일어나지 않습니다.
 */
@Component
public class EvidenceFinder {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    /** 명백히 범위를 벗어난 주제. 하나라도 걸리면 즉시 거절합니다. */
    private static final Set<String> BLOCKED = Set.of(
            "날씨", "weather", "주가", "주식", "stock", "코인", "비트코인", "환율",
            "코딩", "코드", "프로그래밍", "code", "python", "javascript",
            "정치", "선거", "대통령", "politics", "election",
            "의료", "병원", "약", "진단", "medical", "diagnosis",
            "레시피", "요리법", "recipe", "번역해줘", "숙제", "수학");

    private static final Set<String> SCHEDULE_WORDS = Set.of(
            "일정", "콘서트", "공연", "방송", "출연", "팬미팅", "언제", "스케줄",
            "schedule", "concert", "broadcast", "fanmeeting", "when");

    private static final Set<String> GATHERING_WORDS = Set.of(
            "모임", "참여", "신청", "버스", "동행", "같이", "함께", "모집",
            "gathering", "join", "meetup", "together");

    private static final Set<String> CONTENT_WORDS = Set.of(
            "영상", "기사", "뉴스", "무대", "직캠", "콘텐츠", "보고", "추천",
            "video", "article", "news", "clip", "recommend", "watch");

    private static final Set<String> PLACE_WORDS = Set.of(
            "장소", "성지", "맛집", "카페", "다녀간", "어디", "위치",
            "place", "restaurant", "cafe", "where", "visited");

    private static final Set<String> TIP_WORDS = Set.of(
            "투표", "스밍", "스트리밍", "응원", "티켓", "팁", "방법", "어떻게",
            "vote", "streaming", "ticket", "tip", "how");

    /** 플랫폼 주제임을 강하게 시사하는 단어. 의도가 안 잡혀도 이게 있으면 GENERAL 로 받습니다. */
    private static final Set<String> DOMAIN_WORDS = Set.of(
            "임영웅", "트롯", "트로트", "mbn", "가수", "스타", "팬덤", "팬",
            "trot", "star", "fandom", "fan", "bienie", "비엔이");

    private final ScheduleRepository scheduleRepository;
    private final ContentRepository contentRepository;
    private final GatheringRepository gatheringRepository;
    private final PlaceRepository placeRepository;
    private final TipRepository tipRepository;

    public EvidenceFinder(
            ScheduleRepository scheduleRepository,
            ContentRepository contentRepository,
            GatheringRepository gatheringRepository,
            PlaceRepository placeRepository,
            TipRepository tipRepository) {
        this.scheduleRepository = scheduleRepository;
        this.contentRepository = contentRepository;
        this.gatheringRepository = gatheringRepository;
        this.placeRepository = placeRepository;
        this.tipRepository = tipRepository;
    }

    public Intent classify(String question) {
        String q = question.toLowerCase(Locale.ROOT);

        if (containsAny(q, BLOCKED)) {
            return Intent.OUT_OF_SCOPE;
        }
        if (containsAny(q, SCHEDULE_WORDS)) {
            return Intent.SCHEDULE;
        }
        if (containsAny(q, GATHERING_WORDS)) {
            return Intent.GATHERING;
        }
        if (containsAny(q, PLACE_WORDS)) {
            return Intent.PLACE;
        }
        if (containsAny(q, TIP_WORDS)) {
            return Intent.TIP;
        }
        if (containsAny(q, CONTENT_WORDS)) {
            return Intent.CONTENT;
        }
        // 의도는 안 잡혔지만 플랫폼 주제라면 폭넓게 근거를 모아 답해봅니다.
        return containsAny(q, DOMAIN_WORDS) ? Intent.GENERAL : Intent.OUT_OF_SCOPE;
    }

    public List<Evidence> find(Intent intent, Long starId) {
        return switch (intent) {
            case SCHEDULE -> schedules(starId);
            case GATHERING -> gatherings(starId);
            case CONTENT -> contents(starId);
            case PLACE -> places(starId);
            case TIP -> tips(starId);
            case GENERAL -> {
                List<Evidence> all = new ArrayList<>();
                all.addAll(schedules(starId));
                all.addAll(gatherings(starId));
                all.addAll(contents(starId));
                yield all;
            }
            case OUT_OF_SCOPE -> List.of();
        };
    }

    private List<Evidence> schedules(Long starId) {
        return scheduleRepository
                .findByStarIdAndStartAtAfterOrderByStartAtAsc(
                        starId, java.time.Instant.now(), PageRequest.of(0, 3))
                .getContent().stream()
                .map(s -> new Evidence(
                        CitationType.SCHEDULE,
                        s.getId(),
                        s.getTitle(),
                        "%s · %s".formatted(
                                DATE.format(s.getStartAt().atZone(KST)),
                                s.getVenue() == null ? "장소 미정" : s.getVenue())))
                .toList();
    }

    private List<Evidence> gatherings(Long starId) {
        return gatheringRepository
                .findByStarIdAndStatusOrderByDeadlineAsc(
                        starId, GatheringStatus.RECRUITING, PageRequest.of(0, 3))
                .getContent().stream()
                .map(g -> new Evidence(
                        CitationType.GATHERING,
                        g.getId(),
                        g.getTitle(),
                        "%d/%d명 모집 중 · %s 마감".formatted(
                                g.getCurrentCount(), g.getCapacity(), g.getDeadline())))
                .toList();
    }

    private List<Evidence> contents(Long starId) {
        return contentRepository.findTop10ByStarIdOrderByPublishedAtDesc(starId).stream()
                .limit(3)
                .map(c -> new Evidence(
                        CitationType.CONTENT,
                        c.getId(),
                        c.getTitle(),
                        "%s · %s".formatted(
                                c.getChannel().getName(),
                                DATE.format(c.getPublishedAt().atZone(KST)))))
                .toList();
    }

    private List<Evidence> places(Long starId) {
        return placeRepository.findTop10ByStarIdOrderByIdAsc(starId).stream()
                .limit(3)
                .map(p -> new Evidence(
                        CitationType.PLACE,
                        p.getId(),
                        p.getName(),
                        p.getVisitContext() == null ? p.getAddress() : p.getVisitContext()))
                .toList();
    }

    private List<Evidence> tips(Long starId) {
        return tipRepository.findTop6ByStarIdOrderByUpdatedAtDesc(starId).stream()
                .limit(3)
                .map(t -> new Evidence(
                        CitationType.TIP,
                        t.getId(),
                        t.getTitle(),
                        "%s 안내".formatted(t.getCategory().name())))
                .toList();
    }

    private static boolean containsAny(String text, Set<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }
}
