package kr.co.mbn.trot.ai.provider;

/** docs/api-spec.yaml 의 {@code Citation.type} 과 값이 일치해야 합니다. */
public enum CitationType {
    SCHEDULE,
    CONTENT,
    GATHERING,
    PLACE,
    TIP,
    /** DB 리소스가 아니라 **이 앱의 기능(화면)** 안내. id 가 없고 route 로 이동합니다. */
    FEATURE
}
