package kr.co.mbn.trot.star.dto;

import kr.co.mbn.trot.star.domain.Star;

/**
 * docs/api-spec.yaml 의 {@code Star} 스키마와 1:1 대응.
 * 엔티티를 컨트롤러에서 직접 반환하지 말고 항상 이 DTO 로 변환하세요.
 */
public record StarResponse(
        Long id,
        String name,
        String nameEn,
        String profileImageUrl,
        String coverImageUrl,
        String greeting,
        boolean verified,
        int followerCount
) {

    public static StarResponse from(Star star) {
        return new StarResponse(
                star.getId(),
                star.getName(),
                star.getNameEn(),
                star.getProfileImageUrl(),
                star.getCoverImageUrl(),
                star.getGreeting(),
                star.isVerified(),
                star.getFollowerCount());
    }
}
