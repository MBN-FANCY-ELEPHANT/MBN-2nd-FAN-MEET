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

    /**
     * <b>이 앱 자체</b>에 대한 질문. "어떤 기능이 있어?", "공연 예매하고 싶어" 처럼
     * 도메인 단어가 없어도 서비스 질문이면 받아야 합니다.
     *
     * <p>⚠️ 이전에는 이런 질문이 최종 폴백에서 {@code OUT_OF_SCOPE} 로 떨어져
     * <b>LLM 호출조차 되지 않았습니다.</b> 도우미가 자기 앱을 모르는 상태였습니다.
     */
    private static final Set<String> SERVICE_WORDS = Set.of(
            "기능", "뭐 할", "뭘 할", "뭐가 있", "무엇을 할", "무엇이 있", "뭐 있",
            "사용법", "어떻게 써", "어떻게 쓰", "메뉴", "어디서", "어디로",
            "예매", "응모", "구매", "사고 싶", "신청하고 싶", "참여하고 싶",
            "what can you", "how do i", "how to use", "feature", "menu");

    /**
     * <b>서비스 질문보다 먼저</b> 봐야 하는 장소 단어.
     *
     * <p>⚠️ {@code SERVICE_WORDS} 에 "어디서"·"어디로" 가 들어 있어서 "성지순례 어디로 가면 돼?"
     * 가 SERVICE 로 분류되고, 성지순례와 상관없는 공연·모집 기능이 안내됐습니다 (실제로 겪음).
     * 이 단어들이 있으면 명백히 장소 질문이므로 PLACE 가 이깁니다.
     */
    private static final Set<String> STRONG_PLACE_WORDS = Set.of(
            "성지", "성지순례", "맛집", "카페", "다녀간", "다녀온",
            "pilgrimage", "restaurant", "cafe");

    /**
     * 플랫폼 주제임을 강하게 시사하는 단어. 의도가 안 잡혀도 이게 있으면 GENERAL 로 받습니다.
     *
     * <p>⚠️ 앞의 세 개는 <b>시드 아티스트 이름</b>입니다 (data.sql 의 star). 이름만 말한
     * 질문("박서진 요즘 뭐해?")이 스코프 밖으로 거절되지 않게 하려면 여기 있어야 합니다.
     * <b>아티스트를 늘리면 이 목록도 함께 늘리세요.</b>
     */
    private static final Set<String> DOMAIN_WORDS = Set.of(
            "성리", "이찬원", "박서진",
            "트롯", "트로트", "mbn", "가수", "스타", "팬덤", "팬",
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

    /**
     * 명백히 범위 밖인 주제인지. <b>모집 대화방 세션</b>은 스코프 판정을 여기까지만 합니다 —
     * 그 방 안의 질문은 대부분 그 모임 이야기라 도메인 키워드가 없어도 받아야 합니다
     * ("몇 시까지 가면 되나요?" 에는 도메인 단어가 하나도 없습니다).
     */
    public boolean isBlocked(String question) {
        return containsAny(question.toLowerCase(Locale.ROOT), BLOCKED);
    }

    /**
     * 특정 모임 하나를 근거로. <b>대화방 세션에서 모든 질문에 항상 붙습니다.</b>
     *
     * <p>목록용 {@link #gatherings} 보다 <b>자세합니다</b> — 집결지·행사일·참가비·공지까지
     * 넣어야 "집결지 어디예요?", "참가비 얼마예요?" 에 답할 수 있습니다.
     */
    public java.util.Optional<Evidence> gatheringEvidence(Long gatheringId) {
        return gatheringRepository.findById(gatheringId).map(g -> Evidence.of(
                CitationType.GATHERING,
                g.getId(),
                g.getTitle(),
                "집결지 %s · 행사일 %s · 참가비 %s · %d/%d명 · %s 마감%s".formatted(
                        g.getMeetingPoint() == null ? "미정" : g.getMeetingPoint(),
                        DATE.format(g.getEventAt().atZone(KST)),
                        g.getFee() == 0 ? "무료" : "%,d원".formatted(g.getFee()),
                        g.getCurrentCount(), g.getCapacity(),
                        g.getDeadline(),
                        g.getNotice() == null ? "" : " · 공지: " + g.getNotice())));
    }

    public Intent classify(String question) {
        String q = question.toLowerCase(Locale.ROOT);

        if (containsAny(q, BLOCKED)) {
            return Intent.OUT_OF_SCOPE;
        }
        // ⚠️ 서비스 질문을 **도메인 의도보다 먼저** 봅니다. "공연 예매하고 싶어" 는
        //    SCHEDULE_WORDS 의 "공연" 에 먼저 걸려 일정만 답하고 예매 화면을 못 알려줍니다.
        //    반대로 "콘서트가 언제야?" 에는 예매/응모 같은 서비스 표현이 없어 그대로 SCHEDULE 입니다.
        // 장소 단어는 서비스 질문보다 먼저입니다 — 위 STRONG_PLACE_WORDS 주석 참고.
        if (containsAny(q, STRONG_PLACE_WORDS)) {
            return Intent.PLACE;
        }
        if (containsAny(q, SERVICE_WORDS)) {
            return Intent.SERVICE;
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

    public List<Evidence> find(Intent intent, Long starId, String question) {
        return switch (intent) {
            case SCHEDULE -> schedules(starId);
            case GATHERING -> gatherings(starId);
            case CONTENT -> contents(starId);
            case PLACE -> places(starId);
            case TIP -> tips(starId);
            // 기능 카탈로그 + 일정·모임. "공연 예매하고 싶어" 에 **어디서 하는지와
            // 지금 뭐가 열려 있는지**를 함께 답할 수 있어야 합니다.
            case SERVICE -> {
                List<Evidence> all = new ArrayList<>(ServiceCatalog.featuresFor(question));
                all.addAll(schedules(starId));
                all.addAll(gatherings(starId));
                yield all;
            }
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
                .map(s -> Evidence.of(
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
                .map(g -> Evidence.of(
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
                .map(c -> Evidence.of(
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
                .map(p -> Evidence.of(
                        CitationType.PLACE,
                        p.getId(),
                        p.getName(),
                        p.getVisitContext() == null ? p.getAddress() : p.getVisitContext()))
                .toList();
    }

    private List<Evidence> tips(Long starId) {
        return tipRepository.findTop6ByStarIdOrderByUpdatedAtDesc(starId).stream()
                .limit(3)
                .map(t -> Evidence.of(
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
