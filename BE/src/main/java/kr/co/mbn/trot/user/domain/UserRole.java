package kr.co.mbn.trot.user.domain;

/**
 * 사용자 권한.
 *
 * <p>MVP 에서는 실질적으로 MEMBER 만 씁니다. ADMIN 은 AI 분석 재생성 같은 시연용
 * 관리 엔드포인트를 구분하기 위해 남겨둡니다.
 */
public enum UserRole {
    MEMBER,
    ADMIN
}
