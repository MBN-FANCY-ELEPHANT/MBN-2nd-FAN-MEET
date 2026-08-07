package kr.co.mbn.trot.chat.dto;

import jakarta.validation.constraints.NotNull;
import kr.co.mbn.trot.user.domain.Locale;

/**
 * @param artistName 랜딩에서 고른 응원 아티스트 이름 (선택).
 *                   ⚠️ 데모 편의 필드입니다 — MVP 는 스타 1명 데이터만 있고 아티스트
 *                   선택이 표시 전용이라, AI 가 이 이름을 전제로 답하도록 넘깁니다.
 *                   다중 스타가 확정되면 starId 로 대체하세요 (docs/api-spec.yaml).
 */
public record ChatSessionCreateRequest(
        @NotNull Long starId,
        Locale locale,
        String artistName
) {
}
