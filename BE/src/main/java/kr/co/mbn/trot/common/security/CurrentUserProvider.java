package kr.co.mbn.trot.common.security;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;

/**
 * 현재 요청의 사용자 ID를 제공합니다.
 *
 * <p>{@code DemoAuthFilter} 가 SecurityContext 에 채워둔 principal 을 읽습니다.
 *
 * <ul>
 *   <li>{@link #requireUserId()} — 쓰기 작업용. 미인증이면 401</li>
 *   <li>{@link #findUserId()} — 조회 작업용. 비로그인이면 empty
 *       (좋아요/구독 여부를 false 로 내리기 위해 필요)</li>
 * </ul>
 */
@Component
public class CurrentUserProvider {

    public Long requireUserId() {
        return findUserId().orElseThrow(() -> new ApiException(ErrorCode.UNAUTHORIZED));
    }

    public Optional<Long> findUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        return (authentication.getPrincipal() instanceof Long userId)
                ? Optional.of(userId)
                : Optional.empty();
    }

    public boolean isAuthenticated() {
        return findUserId().isPresent();
    }
}
