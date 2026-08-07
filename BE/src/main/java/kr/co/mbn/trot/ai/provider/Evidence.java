package kr.co.mbn.trot.ai.provider;

/**
 * AI 답변의 근거 후보. 플랫폼 DB 에서 조회된 실제 데이터입니다.
 *
 * <p>{@code detail} 은 프롬프트에 넣을 사실 정보(날짜, 장소, 인원 등)이며,
 * {@code title} 은 딥링크 카드에 표시할 라벨입니다.
 */
public record Evidence(
        CitationType type,
        Long id,
        String title,
        String detail,
        String route
) {

    /** DB 리소스 근거 — 화면 경로는 FE 가 type/id 로 유추합니다. */
    public static Evidence of(CitationType type, Long id, String title, String detail) {
        return new Evidence(type, id, title, detail, null);
    }

    /** 기능 안내 근거 — id 가 없고 route 로 이동합니다. */
    public static Evidence feature(String title, String detail, String route) {
        return new Evidence(CitationType.FEATURE, null, title, detail, route);
    }
}
