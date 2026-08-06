package kr.co.mbn.trot.content.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 콘텐츠 ↔ 장소 연결. 뉴스 상세 하단 "기사에 나온 그 곳" 캐러셀에 대응합니다.
 *
 * <p>PLAY 탭의 "성지순례"와 같은 {@code Place} 데이터를 다른 진입점에서 보여주는 구조입니다.
 */
@Entity
@Table(name = "content_place",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_content_place", columnNames = {"content_id", "place_id"}))
public class ContentPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Column(name = "place_id", nullable = false)
    private Long placeId;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    protected ContentPlace() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public Long getContentId() {
        return contentId;
    }

    public Long getPlaceId() {
        return placeId;
    }

    public int getSortOrder() {
        return sortOrder;
    }
}
