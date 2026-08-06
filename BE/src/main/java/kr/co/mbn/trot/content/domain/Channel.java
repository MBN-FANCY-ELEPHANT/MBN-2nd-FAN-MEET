package kr.co.mbn.trot.content.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** 콘텐츠 채널. 영상 상세의 "MBN 로고 + 구독" 버튼에 대응합니다. */
@Entity
@Table(name = "channel")
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    /** 비정규화 캐시. 반드시 {@code ChannelRepository} 의 원자적 UPDATE 로만 변경하세요. */
    @Column(name = "subscriber_count", nullable = false)
    private int subscriberCount;

    protected Channel() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public int getSubscriberCount() {
        return subscriberCount;
    }
}
