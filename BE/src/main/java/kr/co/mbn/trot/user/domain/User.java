package kr.co.mbn.trot.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 사용자.
 *
 * <p><b>인증은 간소화합니다.</b> 회원가입·비밀번호·소셜 로그인을 구현하지 않습니다
 * (docs/design-spec.md §3). 데모 계정을 목록에서 골라 원클릭 로그인하므로
 * {@code email}/{@code passwordHash} 컬럼 자체가 없습니다.
 *
 * <p>{@code country} 는 댓글의 국가 배지에 쓰입니다 — "글로벌 팬덤" 서사의 핵심 요소입니다.
 *
 * ⚠️ 테이블명이 {@code app_user} 인 이유: {@code user} 는 PostgreSQL/H2 의 예약어입니다.
 */
@Entity
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String nickname;

    /** 댓글 아바타. 디자인상 항상 노출되므로 사실상 필수입니다. */
    @Column(name = "profile_image_url", nullable = false, length = 500)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 2)
    private Country country;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Locale locale;

    protected User() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public String getNickname() {
        return nickname;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public Country getCountry() {
        return country;
    }

    public UserRole getRole() {
        return role;
    }

    public Locale getLocale() {
        return locale;
    }
}
