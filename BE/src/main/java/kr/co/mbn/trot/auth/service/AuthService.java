package kr.co.mbn.trot.auth.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.auth.dto.AuthResponse;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.user.domain.User;
import kr.co.mbn.trot.user.domain.UserRole;
import kr.co.mbn.trot.user.dto.UserResponse;
import kr.co.mbn.trot.user.repository.UserRepository;

/**
 * 간이 인증. 비밀번호를 검증하지 않고 데모 계정 선택만으로 토큰을 발급합니다
 * (docs/design-spec.md §3).
 */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final DemoTokenService tokenService;
    private final CurrentUserProvider currentUser;

    public AuthService(
            UserRepository userRepository,
            DemoTokenService tokenService,
            CurrentUserProvider currentUser) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.currentUser = currentUser;
    }

    /** 로그인 화면에 노출할 데모 계정 목록. 국가가 서로 다르게 시드돼 있습니다. */
    public List<UserResponse> getDemoUsers() {
        return userRepository.findByRoleOrderByIdAsc(UserRole.MEMBER).stream()
                .map(UserResponse::from)
                .toList();
    }

    public AuthResponse login(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        return new AuthResponse(tokenService.issue(user.getId()), UserResponse.from(user));
    }

    public UserResponse getMe() {
        return userRepository.findById(currentUser.requireUserId())
                .map(UserResponse::from)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }
}
