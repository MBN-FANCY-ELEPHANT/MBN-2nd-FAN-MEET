package kr.co.mbn.trot.chat.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import kr.co.mbn.trot.chat.domain.ChatActionStatus;
import kr.co.mbn.trot.chat.domain.ChatActionType;
import kr.co.mbn.trot.chat.dto.ChatActionResponse;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.entry.dto.ConcertEntryResponse;
import kr.co.mbn.trot.entry.service.ConcertEntryService;
import kr.co.mbn.trot.gathering.domain.ApplicationStatus;
import kr.co.mbn.trot.gathering.domain.Gathering;
import kr.co.mbn.trot.gathering.domain.GatheringApplication;
import kr.co.mbn.trot.gathering.domain.GatheringStatus;
import kr.co.mbn.trot.gathering.domain.GatheringType;
import kr.co.mbn.trot.gathering.repository.GatheringApplicationRepository;
import kr.co.mbn.trot.gathering.repository.GatheringRepository;
import kr.co.mbn.trot.gathering.service.GatheringService;
import kr.co.mbn.trot.schedule.domain.Schedule;
import kr.co.mbn.trot.schedule.domain.ScheduleType;
import kr.co.mbn.trot.schedule.repository.ScheduleRepository;
import kr.co.mbn.trot.stage.domain.ArtistStage;
import kr.co.mbn.trot.stage.repository.ArtistStageRepository;

/**
 * <b>말로 기능을 끝까지 완료</b>시키는 계층.
 *
 * <p>지금까지 음성 도우미는 "안내"까지만 했습니다 — "공연 화면에서 응모하실 수 있어요".
 * 중장년 사용자에게는 그 다음 두 번의 탭이 실제 이탈 지점입니다. 그래서
 * <b>"가장 가까운 공연에 응모해줘"</b> 같은 발화는 대상을 찾아 <b>여기서 실제로 실행</b>합니다.
 *
 * <hr>
 *
 * <p><b>설계 제약 (건드리면 되살아나는 버그들)</b>
 *
 * <ol>
 *   <li><b>명령형이 없으면 액션이 아닙니다.</b> {@code IMPERATIVES} 조건을 풀면
 *       "공연 응모는 어떻게 해?" 라는 <b>질문에 진짜 응모가 걸립니다.</b> 되돌릴 수 없는
 *       쓰기라 오분류 비용이 안내 오분류와는 비교가 안 됩니다.</li>
 *   <li><b>"표" 를 명사 키워드로 쓰지 마세요.</b> {@code "투표"} 가 {@code "표"} 를 포함해서
 *       투표 질문이 공연 응모로 갑니다.</li>
 *   <li><b>모집을 공연보다 먼저 봅니다.</b> "서울 공연 가는 버스 대절 신청해줘" 에는 두
 *       어휘가 다 들어 있고, 이때 사용자가 원하는 것은 버스입니다.</li>
 *   <li><b>실패를 예외로 올리지 않습니다.</b> "이미 신청하셨어요" 는 안내이지 에러가
 *       아닙니다. {@link ChatActionStatus} 로 내려 FE 가 문장으로 읽어줍니다.</li>
 *   <li><b>트랜잭션을 갖지 않습니다.</b> {@code ChatService.ask} 는 의도적으로
 *       트랜잭션 밖에서 돕니다 — 여기서 {@code ApiException} 을 잡아도 상위 트랜잭션이
 *       rollback-only 로 마킹돼 대화 저장까지 통째로 실패하기 때문입니다.</li>
 *   <li><b>{@code userId} 를 파라미터로 받습니다.</b> SSE 응답은 별도 스레드에서 만들어지고
 *       {@code SecurityContextHolder} 는 ThreadLocal 이라, 여기서 조회하면 로그인 상태가
 *       항상 비어 보입니다 (실제로 겪기 쉬운 함정).</li>
 * </ol>
 */
@Component
public class VoiceActionResolver {

    private static final Logger log = LoggerFactory.getLogger(VoiceActionResolver.class);

    /**
     * <b>요청형</b> 표현. 하나라도 없으면 액션으로 보지 않습니다 — 위 설계 제약 1번.
     */
    private static final Set<String> IMPERATIVES = Set.of(
            "해줘", "해 줘", "해주세요", "해 주세요", "해줄래", "해 줄래",
            "하고 싶", "하고싶", "할래", "해볼래", "넣어줘", "넣어 줘",
            "신청해", "응모해", "참여해", "참가해", "등록해", "예매해",
            "sign me up", "for me", "please");

    /** 무대 영상은 "보여줘" 계열이 요청형입니다. */
    private static final Set<String> SHOW_VERBS = Set.of(
            "보여", "보고 싶", "보고싶", "틀어", "재생", "들려", "볼래", "봅시다",
            "show", "play", "watch");

    private static final Set<String> STAGE_NOUNS = Set.of(
            "무대", "직캠", "스테이지", "공연 영상", "노래 영상", "부르는", "라이브",
            "stage", "performance", "live");

    /**
     * 모집(버스 대절 · 기부금 모금). 공연보다 먼저 봅니다 — 설계 제약 3번.
     *
     * <p>⚠️ "모금"·"기부" 를 빼면 <b>"기부금 모금 신청 취소해줘" 가 액션으로 잡히지 않습니다</b>
     * ("모집" 과 "모금" 은 다른 낱말입니다 — 실제로 놓쳤습니다).
     */
    private static final Set<String> GATHERING_NOUNS = Set.of(
            "버스", "대절", "모집", "모임", "동행", "단체", "전세버스", "모금", "기부",
            "bus", "gathering", "meetup", "donation");

    /** ⚠️ "표" 를 넣지 마세요 — "투표" 가 걸립니다 (설계 제약 2번). */
    private static final Set<String> CONCERT_NOUNS = Set.of(
            "공연", "콘서트", "티켓", "예매", "응모", "concert", "ticket");

    /**
     * 취소 요청. 여기 걸리면 같은 대상에 대해 <b>신청이 아니라 취소</b>를 실행합니다.
     *
     * <p>⚠️ 이 분기가 없으면 <b>"모집 신청 취소해줘" 가 다시 신청</b>이 됩니다 —
     * "취소해줘" 의 "해줘" 가 요청형에 걸리고 "모집" 이 모집 명사에 걸리기 때문입니다.
     *
     * <p>⚠️ 단어를 {@code "취소"} 로 줄이지 마세요. {@code "응모 취소는 어떻게 해?"} 라는
     * <b>질문에 진짜 취소가 걸립니다.</b> 요청형이 붙은 형태만 봅니다.
     */
    private static final Set<String> CANCEL_WORDS = Set.of(
            "취소해", "취소 해", "취소할", "취소하고 싶", "취소하고싶", "취소 부탁",
            "무르고 싶", "안 갈래", "안갈래",
            "cancel");

    /**
     * 지역 매칭용 어휘. 사용자가 "대전에서 서울로 가는 버스" 라고 말하면 그 두 단어가
     * 모임 설명에 몇 개나 들어 있는지로 대상을 고릅니다.
     *
     * <p>전국 행정구역을 다 넣지 않았습니다 — 시드에 있는 지역 + 광역시·도면 충분하고,
     * 목록이 길어질수록 오탐이 늘어납니다.
     */
    /**
     * 일정 <b>이름 단서에서 빼야 할</b> 낱말.
     *
     * <p>요청 표현("응모해줘")과 흔한 수식어("가장 가까운")는 제목의 단서가 아닙니다.
     * 여기에 "공연"·"콘서트"를 넣은 이유: 안 빼면 <b>"공연 응모해줘" 만으로도</b> 제목에
     * 그 글자가 든 아무 일정이나 골라집니다.
     */
    private static final Set<String> TITLE_STOPWORDS = Set.of(
            // 요청 표현
            "응모", "신청", "예매", "참여", "참가", "티켓", "취소", "관람", "가고",
            "해줘", "해주세요", "해줄래", "하고", "싶어", "싶은", "싶다", "할래", "줄래", "부탁",
            // 수식어·지시어
            "가장", "가까운", "가까이", "제일", "빠른", "이번", "대한", "표를",
            "우리", "오빠", "언니", "누나", "그분", "저기", "여기", "아무", "내가", "제가",
            // 시간 표현 — 이름이 아닙니다
            "오늘", "내일", "모레", "다음", "다음주", "이번주", "주말", "올해", "내년",
            // 종류 이름 — 안 빼면 "공연 응모해줘" 만으로 아무 일정이나 골라집니다
            "공연", "콘서트", "일정", "스케줄", "모집", "모임",
            "관련", "있는", "하는", "무슨", "어떤",
            "concert", "ticket", "apply", "entry", "cancel",
            "please", "the", "for", "next", "closest", "nearest");

    /**
     * 요청 동사의 <b>어간</b>. 이 글자로 시작하는 낱말은 이름 단서가 아닙니다.
     *
     * <p>⚠️ 어간으로 걸러야 합니다. {@code TITLE_STOPWORDS} 에 "응모" 만 넣으면
     * <b>"응모해"·"응모하고" 가 그대로 단서로 남아</b> 어느 일정과도 안 맞고,
     * "가장 가까운 공연 응모해줘" 마저 "찾지 못했어요" 가 됩니다 (실제로 겪음).
     * 활용형을 하나씩 나열하는 것은 끝이 없습니다.
     */
    private static final List<String> REQUEST_STEMS = List.of(
            "응모", "신청", "취소", "예매", "참여", "참가", "관람",
            "보여", "틀어", "알려", "부탁", "해주", "해줄", "해줘");

    private static final Set<String> REGIONS = Set.of(
            "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
            "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
            "수원", "성남", "용인", "고양", "천안", "청주", "전주", "창원", "김해",
            "포항", "구미", "진주", "춘천", "원주", "강릉", "목포", "여수", "순천");

    private final ScheduleRepository scheduleRepository;
    private final GatheringRepository gatheringRepository;
    private final GatheringApplicationRepository applicationRepository;
    private final ArtistStageRepository stageRepository;
    private final ConcertEntryService entryService;
    private final GatheringService gatheringService;

    public VoiceActionResolver(
            ScheduleRepository scheduleRepository,
            GatheringRepository gatheringRepository,
            GatheringApplicationRepository applicationRepository,
            ArtistStageRepository stageRepository,
            ConcertEntryService entryService,
            GatheringService gatheringService) {
        this.scheduleRepository = scheduleRepository;
        this.gatheringRepository = gatheringRepository;
        this.applicationRepository = applicationRepository;
        this.stageRepository = stageRepository;
        this.entryService = entryService;
        this.gatheringService = gatheringService;
    }

    /**
     * 발화가 기능 완료 요청이면 <b>실행하고</b> 결과를 돌려줍니다. 아니면 {@code null}.
     *
     * @param userId 요청 스레드에서 미리 읽어 넘긴 값 — 설계 제약 6번
     */
    public ChatActionResponse resolveAndRun(
            String question, Long starId, String artistName, Long userId) {

        String q = question.toLowerCase(Locale.ROOT);
        ChatActionResponse action = classifyAndRun(q, starId, artistName, userId);

        if (action != null) {
            // 음성은 Claude 가 검증할 수 없는 구간이라, 무엇이 실행됐는지 로그가 유일한 단서입니다.
            log.info("음성 액션: type={} status={} target={}",
                    action.type(), action.status(), action.targetTitle());
        }
        return action;
    }

    private ChatActionResponse classifyAndRun(
            String q, Long starId, String artistName, Long userId) {

        if (containsAny(q, STAGE_NOUNS) && containsAny(q, SHOW_VERBS)) {
            return stageVideo(q, artistName);
        }

        // ⚠️ 취소 판정이 신청 판정보다 **먼저**입니다. "모집 신청 취소해줘" 는 "해줘"+"모집" 에
        //    걸려 그대로 두면 **다시 신청**이 됩니다 (CANCEL_WORDS 주석 참고).
        boolean cancelling = containsAny(q, CANCEL_WORDS);
        if (!cancelling && !containsAny(q, IMPERATIVES)) {
            return null;
        }
        if (containsAny(q, GATHERING_NOUNS)) {
            return cancelling
                    ? cancelGathering(q, starId, userId, artistName)
                    : joinGathering(q, starId, userId, artistName);
        }
        if (containsAny(q, CONCERT_NOUNS)) {
            return cancelling
                    ? cancelConcert(q, starId, userId, artistName)
                    : enterConcert(q, starId, userId, artistName);
        }
        // 대상 명사 없이 "취소해줘" 만 들어오면 무엇을 취소할지 알 수 없습니다.
        // 임의로 고르면 되돌릴 수 없는 오작동이 되므로 일반 답변으로 넘깁니다.
        return null;
    }

    // ───────────────────────── 공연 응모 ─────────────────────────

    private ChatActionResponse enterConcert(
            String q, Long starId, Long userId, String artistName) {
        Optional<Schedule> target = pickSchedule(q, starId, artistName);
        if (target.isEmpty()) {
            return ChatActionResponse.notFound(ChatActionType.CONCERT_ENTRY);
        }

        Schedule schedule = target.get();
        String route = "/fanspace/concert/" + schedule.getId();

        if (userId == null) {
            return ChatActionResponse.of(
                    ChatActionType.CONCERT_ENTRY, ChatActionStatus.LOGIN_REQUIRED,
                    schedule.getId(), schedule.getTitle(), route);
        }

        ChatActionStatus status;
        try {
            entryService.enter(schedule.getId(), userId);
            status = ChatActionStatus.DONE;
        } catch (ApiException e) {
            status = switch (e.errorCode()) {
                case ENTRY_ALREADY_EXISTS -> ChatActionStatus.ALREADY;
                case ENTRY_CLOSED -> ChatActionStatus.CLOSED;
                default -> ChatActionStatus.NOT_FOUND;
            };
        }
        return ChatActionResponse.of(
                ChatActionType.CONCERT_ENTRY, status,
                schedule.getId(), schedule.getTitle(), route);
    }

    /**
     * 응모 대상 고르기 — <b>이름 → 지역 → 최근접</b> 순입니다.
     *
     * <p>⚠️ <b>이름 매칭이 가장 먼저입니다.</b> 이게 없던 동안 "MBN 트롯가왕 본선 3차 응모해줘"
     * 라고 말해도 지역어가 없다는 이유로 <b>최근접 일정(팬미팅)에 응모가 걸렸습니다.</b>
     * 사용자는 자기가 말한 공연이 아닌 곳에 응모된 줄도 모릅니다 — 되돌릴 수 없는 쓰기라
     * 오분류 비용이 큽니다.
     *
     * <p>"가장 가까운 공연 응모해줘" 처럼 이름도 지역도 없는 발화만 최근접으로 갑니다.
     * 그래서 "가장 가까운" 같은 수식어를 따로 볼 필요가 없습니다.
     */
    private Optional<Schedule> pickSchedule(String q, Long starId, String artistName) {
        List<Schedule> upcoming = scheduleRepository
                .findByStarIdAndStartAtAfterOrderByStartAtAsc(
                        starId, Instant.now(), PageRequest.of(0, 20))
                .getContent();
        if (upcoming.isEmpty()) {
            return Optional.empty();
        }

        // ① 이름 — 단서가 있으면 **그 결과가 곧 답입니다.** 못 찾았으면 못 찾은 겁니다.
        List<String> clues = titleClues(q, artistName);
        if (!clues.isEmpty()) {
            return bestByName(upcoming, clues,
                    s -> s.getTitle() + " " + nullSafe(s.getVenue()));
        }

        // ② 지역 — "부산 공연 응모해줘"
        List<String> regions = mentionedRegions(q);
        if (!regions.isEmpty()) {
            Optional<Schedule> byRegion = upcoming.stream()
                    .filter(s -> regions.stream().anyMatch(r ->
                            contains(s.getTitle(), r) || contains(s.getVenue(), r)))
                    .findFirst();
            if (byRegion.isPresent()) {
                return byRegion;
            }
        }

        // ③ 최근접. 공연/팬미팅처럼 **현장 관람**이 있는 일정을 방송보다 앞에 둡니다.
        return Optional.of(upcoming.stream()
                .filter(s -> s.getType() == ScheduleType.CONCERT
                        || s.getType() == ScheduleType.FANMEETING)
                .findFirst()
                .orElseGet(() -> upcoming.get(0)));
    }

    /**
     * 발화에서 <b>대상 이름 단서</b>가 될 만한 낱말만 남깁니다.
     *
     * <p>조사를 떼고, 한 글자와 {@link #TITLE_STOPWORDS} 를 버립니다. 한 글자를 버리는 것이
     * 중요합니다 — "탑", "그", "이" 같은 글자는 아무 제목에나 걸려 엉뚱한 대상을 고릅니다.
     *
     * <p>⚠️ <b>응원 아티스트 이름도 단서가 아닙니다.</b> "이찬원 공연 응모해줘" 는 특정 공연을
     * 지목한 것이 아니라 그냥 "내 아티스트의 공연" 이라는 뜻입니다. 이걸 단서로 두면 시드
     * 제목(임영웅)과 안 맞아 <b>"찾지 못했어요" 가 나갑니다.</b>
     */
    private static List<String> titleClues(String q, String artistName) {
        Set<String> ignored = new java.util.HashSet<>(TITLE_STOPWORDS);
        if (artistName != null && !artistName.isBlank()) {
            String name = artistName.toLowerCase(Locale.ROOT);
            ignored.add(name);
            ignored.add(shortName(artistName).toLowerCase(Locale.ROOT));
        }
        return Arrays.stream(q.split("[\\s,./!?~\\-\\[\\]()「」'\"]+"))
                .map(VoiceActionResolver::stripParticle)
                .filter(token -> token.length() >= 2)
                .filter(token -> !ignored.contains(token))
                .filter(token -> REQUEST_STEMS.stream().noneMatch(token::startsWith))
                .distinct()
                .toList();
    }

    /**
     * 후보 중 이름이 가장 잘 맞는 것.
     *
     * <p>⚠️ <b>단서가 있는데 아무것도 안 맞으면 {@code null} 을 돌려줍니다 — 이게 핵심입니다.</b>
     * 예전에는 이럴 때 "가장 최근 것" 으로 조용히 떨어졌고, 그래서
     * <b>"MBN 트롯가왕 본선 3차 응모 취소해줘" 가 엉뚱한 팬미팅 응모를 취소</b>했습니다.
     * 사용자가 지목한 것이 없으면 아무거나 건드리지 말고 못 찾았다고 답해야 합니다.
     *
     * @return 맞는 후보 / 단서가 아예 없으면 {@code Optional.empty()} (호출부가 기본값을 씁니다)
     */
    private static <T> java.util.Optional<T> bestByName(
            List<T> candidates,
            List<String> clues,
            java.util.function.Function<T, String> text) {

        if (clues.isEmpty()) {
            return Optional.empty();
        }
        T best = null;
        int top = 0;
        for (T candidate : candidates) {
            int score = nameScore(text.apply(candidate), clues);
            if (score > top) {
                top = score;
                best = candidate;
            }
        }
        // 단서가 있었는데 0점이면 "지목한 대상이 여기 없다"는 뜻입니다.
        return Optional.ofNullable(best);
    }

    /** 단서가 대상 이름에 몇 개나 들어 있는지. 부분 일치입니다 ("가왕" ⊂ "트롯가왕"). */
    private static int nameScore(String text, List<String> clues) {
        String haystack = nullSafe(text).toLowerCase(Locale.ROOT);
        return (int) clues.stream().filter(haystack::contains).count();
    }

    /**
     * 흔한 조사 떼기.
     *
     * <p>형태소 분석기를 붙이지 않습니다 — 일정이 5건 수준이라 이 정도로 충분하고,
     * 의존성 하나가 데모 기동 시간을 늘리는 것이 더 비쌉니다.
     */
    private static String stripParticle(String token) {
        for (String p : List.of("에서", "으로", "에게", "까지", "부터", "이랑")) {
            if (token.length() > p.length() + 1 && token.endsWith(p)) {
                return token.substring(0, token.length() - p.length());
            }
        }
        for (String p : List.of("은", "는", "이", "가", "을", "를", "에", "의", "도", "만", "과", "와", "로")) {
            if (token.length() > 2 && token.endsWith(p)) {
                return token.substring(0, token.length() - 1);
            }
        }
        return token;
    }

    /**
     * 응모 취소 — 대상은 <b>내가 이미 응모한 공연</b> 중에서 고릅니다.
     *
     * <p>고르는 순서는 응모와 똑같이 <b>이름 → 지역 → 가장 최근 응모</b>입니다.
     *
     * <p>⚠️ <b>이름 매칭이 여기 없어서 실제로 사고가 났습니다.</b>
     * "MBN 트롯가왕 본선 3차 응모 취소해줘" 가 지역어가 없다는 이유로 "가장 최근 응모"로
     * 떨어져 <b>엉뚱한 팬미팅 응모를 취소</b>했습니다. 응모 쪽만 고치고 취소 쪽을 빠뜨리면
     * 같은 사고가 되살아납니다 — 두 경로는 항상 같은 규칙이어야 합니다.
     */
    private ChatActionResponse cancelConcert(
            String q, Long starId, Long userId, String artistName) {
        if (userId == null) {
            return ChatActionResponse.of(
                    ChatActionType.CONCERT_ENTRY_CANCEL, ChatActionStatus.LOGIN_REQUIRED,
                    null, null, "/fanspace/concert");
        }

        // listMine 은 최근 응모순입니다.
        List<ConcertEntryResponse> mine = entryService.listMine(starId, userId);
        if (mine.isEmpty()) {
            return ChatActionResponse.notFound(ChatActionType.CONCERT_ENTRY_CANCEL);
        }

        List<String> clues = titleClues(q, artistName);
        Optional<ConcertEntryResponse> picked = clues.isEmpty()
                ? Optional.empty()
                : bestByName(mine, clues, ConcertEntryResponse::scheduleTitle);

        if (!clues.isEmpty() && picked.isEmpty()) {
            // 특정 공연을 지목했는데 내 응모 내역에 없습니다. 아무거나 취소하면 안 됩니다.
            return ChatActionResponse.notFound(ChatActionType.CONCERT_ENTRY_CANCEL);
        }

        List<String> regions = mentionedRegions(q);
        ConcertEntryResponse target = picked
                .or(() -> mine.stream()
                        .filter(e -> regions.stream()
                                .anyMatch(r -> contains(e.scheduleTitle(), r)))
                        .findFirst())
                .orElseGet(() -> mine.get(0));

        String route = "/fanspace/concert/" + target.scheduleId();
        ChatActionStatus status;
        try {
            entryService.cancel(target.scheduleId(), userId);
            status = ChatActionStatus.DONE;
        } catch (ApiException e) {
            status = ChatActionStatus.NOT_FOUND;
        }
        return ChatActionResponse.of(
                ChatActionType.CONCERT_ENTRY_CANCEL, status,
                target.scheduleId(), target.scheduleTitle(), route);
    }

    // ───────────────────────── 모집 신청 ─────────────────────────

    private ChatActionResponse joinGathering(
            String q, Long starId, Long userId, String artistName) {
        Optional<Gathering> target = pickGathering(q, starId, artistName);
        if (target.isEmpty()) {
            return ChatActionResponse.notFound(ChatActionType.GATHERING_JOIN);
        }

        Gathering gathering = target.get();
        String route = "/community/gatherings/" + gathering.getId();

        if (userId == null) {
            return ChatActionResponse.of(
                    ChatActionType.GATHERING_JOIN, ChatActionStatus.LOGIN_REQUIRED,
                    gathering.getId(), gathering.getTitle(), route);
        }

        ChatActionStatus status;
        try {
            gatheringService.apply(gathering.getId(), userId, null);
            status = ChatActionStatus.DONE;
        } catch (ApiException e) {
            status = switch (e.errorCode()) {
                case GATHERING_ALREADY_APPLIED -> ChatActionStatus.ALREADY;
                case GATHERING_FULL -> ChatActionStatus.FULL;
                case GATHERING_CLOSED -> ChatActionStatus.CLOSED;
                default -> ChatActionStatus.NOT_FOUND;
            };
        }
        return ChatActionResponse.of(
                ChatActionType.GATHERING_JOIN, status,
                gathering.getId(), gathering.getTitle(), route);
    }

    /**
     * 모집 대상 고르기 — <b>출발지·도착지 단어가 몇 개나 맞는지</b>로 고릅니다.
     *
     * <p>"대전에서 서울로 가는 버스" 는 시드의 "0829 관광 버스 대절 모집 (대전 출발)"
     * (설명에 "서울 KSPO DOME") 과 두 단어가 다 맞습니다. 지역이 안 잡히면 버스 모임 중
     * 마감이 가까운 것을 씁니다.
     *
     * <p>⚠️ 상태가 {@code RECRUITING} 인 것만 후보입니다 — {@code OPEN} 이 아닙니다
     * (이 프로젝트에서 이미 한 번 밟은 함정).
     */
    private Optional<Gathering> pickGathering(String q, Long starId, String artistName) {
        List<Gathering> open = gatheringRepository
                .findByStarIdAndStatusOrderByDeadlineAsc(
                        starId, GatheringStatus.RECRUITING, PageRequest.of(0, 20))
                .getContent();
        if (open.isEmpty()) {
            return Optional.empty();
        }

        // 이름을 지목했으면 그게 답입니다 ("광주 출발 버스 대절 신청해줘").
        // 못 찾으면 아래 지역·종류 매칭으로 넘어갑니다 — 모집은 제목이 날짜로 시작해서
        // ("0829 관광 버스…") 이름만으로 지목하기 어렵기 때문입니다.
        List<String> clues = titleClues(q, artistName);
        Optional<Gathering> byName = bestByName(open, clues,
                g -> g.getTitle() + " " + nullSafe(g.getSummary()));
        if (byName.isPresent()) {
            return byName;
        }

        boolean wantsBus = q.contains("버스") || q.contains("대절") || q.contains("bus");
        List<String> regions = mentionedRegions(q);

        Comparator<Gathering> byFit = Comparator
                .comparingInt((Gathering g) -> regionScore(g, regions))
                .thenComparingInt(g -> wantsBus && g.getType() == GatheringType.BUS ? 1 : 0);

        // 점수가 같으면 앞선 것(= 마감이 가까운 것)이 남도록 max 가 아니라 reduce 로 고릅니다.
        Gathering best = open.stream()
                .reduce((a, b) -> byFit.compare(b, a) > 0 ? b : a)
                .orElseThrow();

        // 지역도 안 맞고 버스도 아니면 사용자가 말한 모임이 아닐 가능성이 큽니다.
        if (regionScore(best, regions) == 0
                && wantsBus
                && best.getType() != GatheringType.BUS) {
            return Optional.empty();
        }
        return Optional.of(best);
    }

    /** 모임 텍스트 전체에서 발화에 나온 지역이 몇 개나 맞는지. */
    private static int regionScore(Gathering g, List<String> regions) {
        if (regions.isEmpty()) {
            return 0;
        }
        String text = String.join(" ",
                nullSafe(g.getTitle()), nullSafe(g.getSummary()),
                nullSafe(g.getDescription()), nullSafe(g.getMeetingPoint()));
        return (int) regions.stream().filter(text::contains).count();
    }

    /**
     * 모집 신청 취소 — 대상은 <b>내가 지금 신청 중인 모집</b> 중에서 고릅니다.
     *
     * <p>⚠️ 전체 모집 목록에서 고르면 안 됩니다. 신청하지도 않은 모집을 취소 시도하면
     * "신청 내역이 없습니다" 가 나가는데, 사용자는 자기가 신청한 것이 사라진 줄 압니다.
     */
    private ChatActionResponse cancelGathering(
            String q, Long starId, Long userId, String artistName) {
        if (userId == null) {
            return ChatActionResponse.of(
                    ChatActionType.GATHERING_CANCEL, ChatActionStatus.LOGIN_REQUIRED,
                    null, null, "/fanspace/gathering");
        }

        List<Long> appliedIds = applicationRepository
                .findByUserIdAndStatusOrderByAppliedAtDesc(userId, ApplicationStatus.APPLIED)
                .stream()
                .map(GatheringApplication::getGatheringId)
                .toList();

        List<Gathering> mine = appliedIds.isEmpty()
                ? List.of()
                : gatheringRepository.findAllById(appliedIds).stream()
                        .filter(g -> g.getStarId().equals(starId))
                        .toList();

        if (mine.isEmpty()) {
            return ChatActionResponse.notFound(ChatActionType.GATHERING_CANCEL);
        }

        // 응모 취소와 같은 규칙입니다 — 이름 → 지역 → 가장 최근 신청.
        List<String> clues = titleClues(q, artistName);
        Optional<Gathering> picked = clues.isEmpty()
                ? Optional.empty()
                : bestByName(mine, clues, Gathering::getTitle);

        if (!clues.isEmpty() && picked.isEmpty()) {
            // 특정 모집을 지목했는데 내 신청 내역에 없습니다.
            return ChatActionResponse.notFound(ChatActionType.GATHERING_CANCEL);
        }

        List<String> regions = mentionedRegions(q);
        Gathering target = picked
                .or(() -> mine.stream()
                        .filter(g -> regionScore(g, regions) > 0)
                        .findFirst())
                .orElseGet(() -> mine.get(0));

        String route = "/community/gatherings/" + target.getId();
        ChatActionStatus status;
        try {
            gatheringService.cancel(target.getId(), userId);
            status = ChatActionStatus.DONE;
        } catch (ApiException e) {
            status = ChatActionStatus.NOT_FOUND;
        }
        return ChatActionResponse.of(
                ChatActionType.GATHERING_CANCEL, status,
                target.getId(), target.getTitle(), route);
    }

    // ──────────────────────── 무대 영상 ────────────────────────

    /**
     * "이찬원 무대 보여줘" — 발화에서 아티스트를 찾고, 없으면 <b>지금 응원 중인 아티스트</b>로 봅니다.
     *
     * <p>⚠️ URL 은 {@code artist_stage} 표에서만 옵니다. LLM 에게 만들게 하면 없는 영상이나
     * 임베드 차단 영상이 나와 검은 화면이 됩니다 ({@link ArtistStage} 주석 참고).
     */
    private ChatActionResponse stageVideo(String q, String sessionArtist) {
        List<ArtistStage> all = stageRepository.findAll();

        Optional<ArtistStage> mentioned = all.stream()
                .filter(s -> q.contains(s.getArtistName().toLowerCase(Locale.ROOT))
                        || q.contains(shortName(s.getArtistName()).toLowerCase(Locale.ROOT)))
                .findFirst();

        ArtistStage stage = mentioned
                .or(() -> sessionArtist == null || sessionArtist.isBlank()
                        ? Optional.empty()
                        : stageRepository.findByArtistName(sessionArtist))
                .orElse(null);

        if (stage == null) {
            return ChatActionResponse.notFound(ChatActionType.STAGE_VIDEO);
        }
        return ChatActionResponse.stageVideo(
                stage.getArtistName(), stage.getTitle(), stage.getEmbedUrl());
    }

    /**
     * 성을 뗀 이름 — "찬원 무대 보여줘" 처럼 부르는 경우가 흔합니다.
     * 한국어 3글자 이름만 자릅니다 (FE {@code shortArtistName} 과 같은 규칙).
     */
    private static String shortName(String name) {
        return (name.length() == 3 && name.matches("[가-힣]{3}"))
                ? name.substring(1)
                : name;
    }

    // ─────────────────────────── 공통 ───────────────────────────

    private static List<String> mentionedRegions(String q) {
        return REGIONS.stream().filter(q::contains).toList();
    }

    private static boolean containsAny(String text, Set<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }

    private static boolean contains(String haystack, String needle) {
        return haystack != null && haystack.contains(needle);
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }
}
