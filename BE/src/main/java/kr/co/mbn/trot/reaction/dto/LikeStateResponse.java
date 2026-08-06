package kr.co.mbn.trot.reaction.dto;

/** docs/api-spec.yaml 의 {@code LikeState} 스키마와 1:1 대응. 하트 토글 후 즉시 반영용. */
public record LikeStateResponse(
        boolean liked,
        int likeCount
) {
}
