package kr.co.mbn.trot.chat.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import kr.co.mbn.trot.ai.provider.Evidence;

/**
 * 이 앱이 제공하는 기능 목록 — 서비스 질문("어떤 기능이 있어?", "공연 예매하고 싶어")의 근거.
 *
 * <p><b>왜 필요한가:</b> 이전에는 이런 질문이 {@code OUT_OF_SCOPE} 로 떨어져 LLM 호출조차
 * 되지 않고 거절 문구가 나갔습니다. 도우미가 자기가 속한 앱을 모르는 셈이었습니다.
 *
 * <p><b>DB 조회가 아닙니다.</b> 화면 구성은 배포 시점에 고정이라 정적 상수로 둡니다 —
 * 조회 비용도 지연도 0 입니다.
 *
 * <p>⚠️ {@code route} 는 <b>FE 라우트와 1:1</b> 이어야 합니다. FE 를 바꾸면 여기도 함께
 * 고치세요 ({@code FE/src/app/App.tsx}, {@code FE/src/features/voice/voiceCommands.ts}).
 */
final class ServiceCatalog {

    /**
     * ⚠️ 순서가 곧 안내 우선순위입니다. LLM 에는 이 목록이 통째로 근거로 들어가고,
     * 그중 질문에 맞는 2~3개만 골라 말하도록 시스템 프롬프트가 지시합니다.
     */
    private static final List<Evidence> FEATURES = List.of(
            // ⚠️ **말로 바로 실행되는 기능은 그 사실을 근거에 적어 둡니다.**
            //    안 적으면 모델이 "이 앱에서는 직접 할 수 없어요" 라고 단정합니다 (실제로 겪음 —
            //    응모 취소가 이미 되는데도 못 한다고 답했습니다).
            Evidence.feature(
                    "공연",
                    "다가오는 공연에 응모하고 응모를 취소합니다. 1인 1매이며 당첨 여부도 여기서 확인합니다. "
                            + "\"○○ 공연 응모해줘\", \"응모 취소해줘\" 라고 말하면 바로 처리해 드립니다.",
                    "/fanspace/concert"),
            Evidence.feature(
                    "모집",
                    "버스 대절과 기부금 모금에 참여 신청하고 신청을 취소합니다. 남은 자리와 마감일을 볼 수 있습니다. "
                            + "\"버스 대절 신청해줘\", \"모집 신청 취소해줘\" 라고 말하면 바로 처리해 드립니다.",
                    "/fanspace/gathering"),
            Evidence.feature(
                    "소식",
                    "아티스트의 활동 기록과 팬매니저 공지를 시간순으로 봅니다.",
                    "/feed"),
            Evidence.feature(
                    "방송",
                    "MBN 기사·롱폼 영상·숏폼을 봅니다.",
                    "/broadcast"),
            Evidence.feature(
                    "굿즈",
                    "응원봉, 슬로건 같은 공식 굿즈를 둘러봅니다.",
                    "/fanspace/goods"),
            Evidence.feature(
                    "투표",
                    "진행 중인 팬 투표에 참여합니다.",
                    "/fanspace/vote"),
            Evidence.feature(
                    "검색",
                    "아티스트 이름, 일정, 모임을 검색합니다.",
                    "/search"),
            // ⚠️ 아래 둘은 **하단 네비에 진입 버튼이 없습니다.** 개편으로 PLAY 탭이 빠지면서
            //    도우미 안내와 인용이 사실상 유일한 진입로가 됐습니다. 메뉴가 생기면 이 주석을 지우세요.
            Evidence.feature(
                    "성지순례",
                    "아티스트가 다녀간 공개된 장소를 지도 없이 목록으로 봅니다. 출처가 있는 정보만 올립니다.",
                    "/play/places"),
            Evidence.feature(
                    "응원 준비",
                    "투표·스밍·티켓팅 방법 같은 응원 팁을 봅니다.",
                    "/play/tips"));

    /** 기능명 매칭용 키워드. 질문에 이게 있으면 그 기능을 맨 앞으로 올립니다. */
    private static final Map<String, List<String>> KEYWORDS = Map.ofEntries(
            Map.entry("공연", List.of("공연", "콘서트", "예매", "응모", "티켓", "취소", "concert", "ticket")),
            Map.entry("모집", List.of("모집", "모임", "버스", "대절", "동행", "기부", "모금",
                    "gathering", "meetup")),
            Map.entry("소식", List.of("소식", "피드", "활동", "news", "feed")),
            Map.entry("방송", List.of("방송", "영상", "기사", "숏폼", "롱폼", "broadcast", "video")),
            Map.entry("굿즈", List.of("굿즈", "상품", "응원봉", "슬로건", "구매", "사고", "goods", "merch")),
            Map.entry("투표", List.of("투표", "vote")),
            Map.entry("검색", List.of("검색", "찾", "search")),
            Map.entry("성지순례", List.of("성지", "장소", "맛집", "카페", "다녀간", "place", "cafe")),
            Map.entry("응원 준비", List.of("응원", "스밍", "스트리밍", "준비물", "팁", "tip", "cheer")));

    private ServiceCatalog() {
    }

    static List<Evidence> features() {
        return FEATURES;
    }

    /**
     * 질문에 언급된 기능을 <b>맨 앞으로</b> 올린 목록.
     *
     * <p>citations 는 앞 3건만 나가므로, 순서를 안 바꾸면 "굿즈 사고 싶어"에
     * 공연·모집·소식 카드가 붙습니다. LLM 도 앞쪽을 먼저 읽어 엉뚱한 기능을 안내합니다.
     */
    static List<Evidence> featuresFor(String question) {
        String q = question.toLowerCase(java.util.Locale.ROOT);
        List<Evidence> matched = new ArrayList<>();
        List<Evidence> rest = new ArrayList<>();
        for (Evidence feature : FEATURES) {
            List<String> words = KEYWORDS.getOrDefault(feature.title(), List.of());
            if (words.stream().anyMatch(q::contains)) {
                matched.add(feature);
            } else {
                rest.add(feature);
            }
        }
        matched.addAll(rest);
        return matched;
    }
}
