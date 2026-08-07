package kr.co.mbn.trot.content.dto;

import java.time.Instant;

import kr.co.mbn.trot.content.domain.Content;
import kr.co.mbn.trot.content.domain.ContentType;

/**
 * docs/api-spec.yaml 의 {@code ContentSummary} 스키마와 1:1 대응. 캐러셀 카드용.
 *
 * <p>FE 는 {@code type} 과 {@code live} 로 카드 하단 메타를 분기합니다:
 * <ul>
 *   <li>{@code ARTICLE} → 좌 {@code channelName}, 우 {@code publishedAt} 상대 시각</li>
 *   <li>{@code VIDEO} → 좌 {@code durationSec}, 우 {@code viewCount}</li>
 *   <li>{@code VIDEO} + {@code live} → 좌 LIVE 배지, 우 {@code viewerCount}</li>
 *   <li>{@code POST} → {@code author}와 {@code postBody}를 사용한 아티스트 피드 카드</li>
 * </ul>
 */
public record ContentSummaryResponse(
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
        Integer durationSec
) {

    public static ContentSummaryResponse from(Content c) {
        return new ContentSummaryResponse(
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
                c.getDurationSec());
    }
}
