package kr.co.mbn.trot.content.dto;

import kr.co.mbn.trot.content.domain.Channel;

/** docs/api-spec.yaml 의 {@code Channel} 스키마와 1:1 대응. */
public record ChannelResponse(
        Long id,
        String name,
        String logoUrl,
        int subscriberCount
) {

    public static ChannelResponse from(Channel c) {
        return new ChannelResponse(c.getId(), c.getName(), c.getLogoUrl(), c.getSubscriberCount());
    }
}
