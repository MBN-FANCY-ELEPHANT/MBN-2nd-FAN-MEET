package kr.co.mbn.trot.chat.dto;

import jakarta.validation.constraints.NotNull;
import kr.co.mbn.trot.user.domain.Locale;

/**
 * @param artistName 랜딩에서 고른 응원 아티스트 이름 (선택).
 *                   ⚠️ 데모 편의 필드입니다 — MVP 는 스타 1명 데이터만 있고 아티스트
 *                   선택이 표시 전용이라, AI 가 이 이름을 전제로 답하도록 넘깁니다.
 *                   다중 스타가 확정되면 starId 로 대체하세요 (docs/api-spec.yaml).
 * @param gatheringId 모집 단체 대화방에서 연 세션이면 그 모임 id (선택).
 *                   그 모임의 집결지·행사일·참가비·공지가 <b>모든 질문의 근거로 항상</b>
 *                   들어갑니다. 없으면 대화방 안에서 "집결지 어디예요?" 를 물어도
 *                   "정보를 제공할 수 없습니다" 가 나갑니다.
 */
public record ChatSessionCreateRequest(
        @NotNull Long starId,
        Locale locale,
        String artistName,
        Long gatheringId
) {
}
