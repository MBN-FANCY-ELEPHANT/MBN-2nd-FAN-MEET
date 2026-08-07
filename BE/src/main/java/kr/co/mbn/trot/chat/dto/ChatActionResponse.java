package kr.co.mbn.trot.chat.dto;

import kr.co.mbn.trot.chat.domain.ChatActionStatus;
import kr.co.mbn.trot.chat.domain.ChatActionType;

/**
 * docs/api-spec.yaml 의 {@code ChatAction} 스키마와 1:1 대응.
 *
 * <p>⚠️ <b>이 응답이 나갈 때는 이미 실행이 끝난 뒤입니다.</b> FE 는 다시 실행하지 말고
 * 결과만 보여주세요.
 *
 * <p>⚠️ 확인 <b>문구는 여기 없습니다.</b> {@code type} + {@code status} 만 내려보내고 문장은
 * FE 가 7개 언어로 만듭니다. BE 에 문안을 두면 i18n 이 두 군데로 갈라집니다.
 */
public record ChatActionResponse(
        ChatActionType type,
        ChatActionStatus status,
        Long targetId,
        String targetTitle,
        String route,
        String videoUrl,
        String videoTitle
) {

    public static ChatActionResponse of(
            ChatActionType type,
            ChatActionStatus status,
            Long targetId,
            String targetTitle,
            String route) {
        return new ChatActionResponse(type, status, targetId, targetTitle, route, null, null);
    }

    /** 대상을 못 찾은 경우 — 라우트도 없습니다. */
    public static ChatActionResponse notFound(ChatActionType type) {
        return new ChatActionResponse(
                type, ChatActionStatus.NOT_FOUND, null, null, null, null, null);
    }

    public static ChatActionResponse stageVideo(
            String artistName, String title, String embedUrl) {
        return new ChatActionResponse(
                ChatActionType.STAGE_VIDEO,
                ChatActionStatus.FOUND,
                null,
                artistName,
                null,
                embedUrl,
                title);
    }
}
