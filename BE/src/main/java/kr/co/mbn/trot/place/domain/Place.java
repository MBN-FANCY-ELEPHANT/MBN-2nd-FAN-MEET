package kr.co.mbn.trot.place.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 스타가 다녀간 장소 — PLAY 탭의 "성지순례", 뉴스 상세의 "기사에 나온 그 곳".
 *
 * <p>⚠️ <b>정책 (협상 대상 아님)</b>: 스타의 실시간 위치·사적 동선은 절대 제공하지 않습니다.
 * 방송·공식 SNS 등으로 <b>이미 공개된</b> 장소만 등록하며 {@code sourceUrl} 은 필수값입니다.
 * 지도는 임베드하지 않고 {@code mapUrl} 외부 링크로 대체합니다.
 */
@Entity
@Table(name = "place")
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "star_id", nullable = false)
    private Long starId;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PlaceType type;

    @Column(nullable = false, length = 300)
    private String address;

    private Double latitude;

    private Double longitude;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    /** 방문한 프로그램 또는 시점. 예: "2026.07 MBN 트롯가왕 촬영" */
    @Column(name = "visit_context", length = 200)
    private String visitContext;

    /** <b>필수.</b> 이미 공개된 출처만 등록합니다. */
    @Column(name = "source_url", nullable = false, length = 500)
    private String sourceUrl;

    /** 카카오맵 등 외부 지도 링크. */
    @Column(name = "map_url", length = 500)
    private String mapUrl;

    protected Place() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public Long getStarId() {
        return starId;
    }

    public String getName() {
        return name;
    }

    public PlaceType getType() {
        return type;
    }

    public String getAddress() {
        return address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getVisitContext() {
        return visitContext;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public String getMapUrl() {
        return mapUrl;
    }
}
