package kr.co.mbn.trot.place.dto;

import java.util.List;

import kr.co.mbn.trot.place.domain.Place;
import kr.co.mbn.trot.place.domain.PlaceType;

/** docs/api-spec.yaml 의 {@code Place} 스키마와 1:1 대응. */
public record PlaceResponse(
        Long id,
        String name,
        PlaceType type,
        String address,
        Double latitude,
        Double longitude,
        String imageUrl,
        String visitContext,
        String sourceUrl,
        String mapUrl,
        List<Long> relatedContentIds
) {

    public static PlaceResponse from(Place p) {
        return from(p, List.of());
    }

    public static PlaceResponse from(Place p, List<Long> relatedContentIds) {
        return new PlaceResponse(
                p.getId(),
                p.getName(),
                p.getType(),
                p.getAddress(),
                p.getLatitude(),
                p.getLongitude(),
                p.getImageUrl(),
                p.getVisitContext(),
                p.getSourceUrl(),
                p.getMapUrl(),
                relatedContentIds);
    }
}
