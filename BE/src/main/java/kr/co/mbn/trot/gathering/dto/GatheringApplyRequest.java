package kr.co.mbn.trot.gathering.dto;

import jakarta.validation.constraints.Size;

/** 모임 참여 신청 요청 본문. 전체가 선택 사항입니다. */
public record GatheringApplyRequest(
        @Size(max = 200, message = "메모는 200자를 넘을 수 없습니다.")
        String note
) {
}
