package kr.co.mbn.trot.user.domain;

/**
 * 지원 언어 7종. 언어 선택 Bottom Sheet 의 항목 순서와 대응합니다.
 *
 * <p>번역 <b>검수는 KO/EN 만</b> 합니다 — 나머지는 AI 생성 결과를 그대로 씁니다
 * (docs/mvp-scope.md 결정 사항).
 */
public enum Locale {
    EN,
    KO,
    FR,
    JA,
    ES,
    ZH,
    RU;

    /** 알 수 없는 값이면 KO 로 폴백합니다. Accept-Language 파싱에 사용합니다. */
    public static Locale fromTagOrDefault(String tag) {
        if (tag == null || tag.isBlank()) {
            return KO;
        }
        String primary = tag.split(",")[0].trim().split("-")[0].toUpperCase(java.util.Locale.ROOT);
        for (Locale l : values()) {
            if (l.name().equals(primary)) {
                return l;
            }
        }
        return KO;
    }
}
