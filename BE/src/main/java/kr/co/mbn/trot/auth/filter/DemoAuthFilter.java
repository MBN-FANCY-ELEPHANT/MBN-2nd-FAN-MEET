package kr.co.mbn.trot.auth.filter;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.mbn.trot.auth.service.DemoTokenService;
import kr.co.mbn.trot.user.repository.UserRepository;

/**
 * {@code Authorization: Bearer <token>} 을 읽어 SecurityContext 에 인증을 채웁니다.
 *
 * <p>토큰이 없거나 위조됐으면 <b>익명으로 통과</b>시킵니다. 조회 API 는 비로그인도 허용해야 하고,
 * 쓰기 API 는 SecurityConfig 가 별도로 막기 때문입니다.
 */
@Component
public class DemoAuthFilter extends OncePerRequestFilter {

    private static final String PREFIX = "Bearer ";

    private final DemoTokenService tokenService;
    private final UserRepository userRepository;

    public DemoAuthFilter(DemoTokenService tokenService, UserRepository userRepository) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(PREFIX)) {
            tokenService.parse(header.substring(PREFIX.length()))
                    .flatMap(userRepository::findById)
                    .ifPresent(user -> {
                        var authentication = new UsernamePasswordAuthenticationToken(
                                user.getId(),
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    });
        }
        chain.doFilter(request, response);
    }
}
