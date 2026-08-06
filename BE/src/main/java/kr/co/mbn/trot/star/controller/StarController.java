package kr.co.mbn.trot.star.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.star.dto.StarResponse;
import kr.co.mbn.trot.star.service.StarService;

/**
 * 이 컨트롤러가 프로젝트 표준 패턴입니다. 새 도메인을 추가할 때 동일한 구조를 따르세요.
 *
 * <pre>
 * {도메인}/
 *   domain/     - JPA 엔티티
 *   repository/ - Spring Data 리포지토리
 *   service/    - 트랜잭션 경계, 비즈니스 규칙, ApiException 발생
 *   dto/        - 요청/응답 record (api-spec.yaml 스키마와 1:1)
 *   controller/ - 얇게. 검증은 @Valid, 예외 변환은 GlobalExceptionHandler 에 위임
 * </pre>
 */
@RestController
@RequestMapping("/api/v1/stars")
public class StarController {

    private final StarService starService;

    public StarController(StarService starService) {
        this.starService = starService;
    }

    @GetMapping("/{starId}")
    public StarResponse getStar(@PathVariable Long starId) {
        return starService.getStar(starId);
    }
}
