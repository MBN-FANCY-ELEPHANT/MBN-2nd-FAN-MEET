package kr.co.mbn.trot.auth.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import kr.co.mbn.trot.auth.dto.AuthResponse;
import kr.co.mbn.trot.auth.dto.LoginRequest;
import kr.co.mbn.trot.auth.service.AuthService;
import kr.co.mbn.trot.user.dto.UserResponse;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}
