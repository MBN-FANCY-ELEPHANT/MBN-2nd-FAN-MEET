package kr.co.mbn.trot.user.dto;

import kr.co.mbn.trot.user.domain.Country;
import kr.co.mbn.trot.user.domain.Locale;
import kr.co.mbn.trot.user.domain.User;
import kr.co.mbn.trot.user.domain.UserRole;

/** docs/api-spec.yaml 의 {@code User} 스키마와 1:1 대응. 댓글 작성자 표시에도 그대로 씁니다. */
public record UserResponse(
        Long id,
        String nickname,
        String profileImageUrl,
        Country country,
        UserRole role,
        Locale locale,
        // 게스트가 선택한 스타를 재접속 후에도 복원할 수 있도록 사용자 응답에 함께 제공합니다.
        Long favoriteStarId,
        String favoriteArtistName
) {

    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(),
                u.getNickname(),
                u.getProfileImageUrl(),
                u.getCountry(),
                u.getRole(),
                u.getLocale(),
                u.getFavoriteStarId(),
                u.getFavoriteArtistName());
    }
}
