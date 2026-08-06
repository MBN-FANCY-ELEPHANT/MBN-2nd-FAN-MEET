package kr.co.mbn.trot.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 사용자 발화.
 *
 * <p>음성 입력이어도 <b>텍스트로 도착합니다</b> — STT 는 브라우저(Web Speech API)에서
 * 처리하기 때문입니다 (docs/ai-stack.md §2). 별도 음성 업로드 엔드포인트가 없습니다.
 */
public record ChatMessageRequest(
        @NotBlank @Size(max = 1000) String content
) {
}
