package kr.co.mbn.trot.auth.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import kr.co.mbn.trot.auth.dto.AuthResponse;
import kr.co.mbn.trot.auth.dto.GuestRegistrationRequest;
import kr.co.mbn.trot.auth.dto.LoginRequest;
import kr.co.mbn.trot.auth.dto.NicknameUpdateRequest;
import kr.co.mbn.trot.auth.service.AuthService;
import kr.co.mbn.trot.user.dto.UserResponse;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 랜딩의 스타 선택을 실제 게스트 계정과 Bearer 토큰으로 연결합니다. */
    @PostMapping("/auth/guest")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerGuest(@Valid @RequestBody GuestRegistrationRequest request) {
        return authService.registerGuest(request);
    }

    @GetMapping("/auth/demo-users")
    public List<UserResponse> getDemoUsers() {
        return authService.getDemoUsers();
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.userId());
    }

    @GetMapping("/users/me")
    public UserResponse getMe() {
        return authService.getMe();
    }

    /** 룰렛 닉네임을 사용자가 원하는 이름으로 확정할 때 호출합니다. */
    @PatchMapping("/users/me/nickname")
    public UserResponse updateNickname(@Valid @RequestBody NicknameUpdateRequest request) {
        return authService.updateNickname(request.nickname());
    }
}
