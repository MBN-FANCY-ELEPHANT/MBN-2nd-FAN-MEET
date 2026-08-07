package kr.co.mbn.trot.config;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import kr.co.mbn.trot.auth.filter.DemoAuthFilter;
import kr.co.mbn.trot.common.error.ErrorCode;

@Configuration
public class SecurityConfig {

    private final List<String> allowedOriginPatterns;
    private final DemoAuthFilter demoAuthFilter;

    public SecurityConfig(
            @Value("${app.cors.allowed-origins}") String allowedOriginPatterns,
            DemoAuthFilter demoAuthFilter) {
        this.allowedOriginPatterns = List.of(allowedOriginPatterns.split(","));
        this.demoAuthFilter = demoAuthFilter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Vite가 5173 다음의 빈 포트를 선택해도 로컬 개발 요청이 403으로 막히지 않게 합니다.
        config.setAllowedOriginPatterns(allowedOriginPatterns);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /**
     * MVP 정책: 조회(GET)는 전면 공개, 쓰기 작업만 인증 요구.
     *
     * <p>{@code DemoAuthFilter} 가 Bearer 토큰을 SecurityContext 에 채웁니다. 토큰이 없어도
     * 필터는 통과시키므로, 비로그인 사용자는 조회만 가능하고 쓰기에서 401 을 받습니다.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .headers(h -> h.frameOptions(f -> f.sameOrigin())) // H2 콘솔용
                .addFilterBefore(demoAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(e -> e.authenticationEntryPoint(unauthorizedEntryPoint()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/h2-console/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/chat/**").permitAll()   // 비회원 챗봇 허용
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/**").permitAll()
                        .anyRequest().authenticated());

        return http.build();
    }

    /**
     * 미인증 요청도 {@code ErrorResponse} 형태로 응답합니다.
     * 기본 동작은 빈 본문이라 FE 의 {@code ApiError.code} 분기가 동작하지 않습니다.
     */
    private AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(ErrorCode.UNAUTHORIZED.status().value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write(
                    "{\"code\":\"UNAUTHORIZED\",\"message\":\""
                            + ErrorCode.UNAUTHORIZED.defaultMessage() + "\"}");
        };
    }
}
