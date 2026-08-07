package kr.co.mbn.trot.content.dto;

import java.time.Instant;
import java.util.List;

import kr.co.mbn.trot.content.domain.Content;
import kr.co.mbn.trot.content.domain.ContentType;
import kr.co.mbn.trot.place.dto.PlaceResponse;

/**
 * docs/api-spec.yaml 의 {@code Content} 스키마와 1:1 대응. 기사·영상·게시물 상세용.
 *
 * <p>{@code type} 에 따라 채워지는 필드가 다릅니다.
 * ARTICLE 이면 {@code body}/{@code reporterName}/{@code places},
 * VIDEO 면 {@code mediaUrl}/{@code durationSec}/{@code live}, POST 면 {@code body}.
 *
 * <p>{@code liked}/{@code subscribed} 는 비로그인 시 항상 false 입니다.
 */
public record ContentResponse(
        Long id,
        ContentType type,
        String title,
        String thumbnailUrl,
        Instant publishedAt,
        String channelName,
        ContentAuthorResponse author,
        String postBody,
        int viewCount,
        int likeCount,
        int commentCount,
        boolean live,
        Integer viewerCount,
        Integer durationSec,
        ChannelResponse channel,
        boolean liked,
        boolean subscribed,
        String body,
        String reporterName,
        String reporterAvatarUrl,
        List<PlaceResponse> places,
        String mediaUrl
) {

    public static ContentResponse from(
            Content c, boolean liked, boolean subscribed, List<PlaceResponse> places) {

        return new ContentResponse(
                c.getId(),
                c.getType(),
                c.getTitle(),
                c.getThumbnailUrl(),
                c.getPublishedAt(),
                c.getChannel().getName(),
                ContentAuthorResponse.from(c),
                c.getType() == ContentType.POST ? c.getBody() : null,
                c.getViewCount(),
                c.getLikeCount(),
                c.getCommentCount(),
                c.isLive(),
                c.getViewerCount(),
                c.getDurationSec(),
                ChannelResponse.from(c.getChannel()),
                liked,
                subscribed,
                c.getBody(),
                c.getReporterName(),
                c.getReporterAvatarUrl(),
                places,
                c.getMediaUrl());
    }
}
