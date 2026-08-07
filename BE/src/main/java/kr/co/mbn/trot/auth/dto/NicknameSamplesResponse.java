package kr.co.mbn.trot.auth.dto;

import java.util.List;

/** docs/api-spec.yaml {@code GET /api/v1/auth/nickname-samples} 응답. 회전 연출 전용 장식값입니다. */
public record NicknameSamplesResponse(List<String> nicknames) {
}
