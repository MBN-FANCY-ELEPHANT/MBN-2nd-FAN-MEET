package kr.co.mbn.trot.star.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 스타(연예인). MVP 는 임영웅 1명으로 운영하되, 모든 콘텐츠 엔티티는 star_id FK 를 갖습니다.
 * 다중 스타 확장 시 스키마 변경 없이 데이터만 추가하면 됩니다. (docs/domain-model.md 참조)
 */
@Entity
@Table(name = "star")
public class Star {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "name_en", length = 100)
    private String nameEn;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(length = 200)
    private String greeting;

    @Column(nullable = false)
    private boolean verified;

    @Column(name = "follower_count", nullable = false)
    private int followerCount;

    protected Star() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getNameEn() {
        return nameEn;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public String getGreeting() {
        return greeting;
    }

    public boolean isVerified() {
        return verified;
    }

    public int getFollowerCount() {
        return followerCount;
    }
}
