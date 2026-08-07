package kr.co.mbn.trot.content.dto;

import kr.co.mbn.trot.content.domain.Content;
import kr.co.mbn.trot.content.domain.ContentAuthorType;

/** docs/api-spec.yaml 의 ContentAuthor 스키마와 1:1 대응. */
public record ContentAuthorResponse(
        ContentAuthorType type,
        String name,
        String profileImageUrl
) {
    public static ContentAuthorResponse from(Content content) {
        return new ContentAuthorResponse(
                content.getAuthorType(),
                content.getAuthorName(),
                content.getAuthorProfileImageUrl());
    }
}
