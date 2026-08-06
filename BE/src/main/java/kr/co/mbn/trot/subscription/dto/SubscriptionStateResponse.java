package kr.co.mbn.trot.subscription.dto;

/** docs/api-spec.yaml 의 {@code SubscriptionState} 스키마와 1:1 대응. */
public record SubscriptionStateResponse(
        boolean subscribed,
        int subscriberCount
) {
}
