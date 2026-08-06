package kr.co.mbn.trot.subscription.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.content.repository.ChannelRepository;
import kr.co.mbn.trot.subscription.domain.Subscription;
import kr.co.mbn.trot.subscription.dto.SubscriptionStateResponse;
import kr.co.mbn.trot.subscription.repository.SubscriptionRepository;

/** 채널 구독 토글. 좋아요와 같은 이유로 멱등하며 카운트는 원자적 UPDATE 로만 변경합니다. */
@Service
@Transactional
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final ChannelRepository channelRepository;
    private final CurrentUserProvider currentUser;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            ChannelRepository channelRepository,
            CurrentUserProvider currentUser) {
        this.subscriptionRepository = subscriptionRepository;
        this.channelRepository = channelRepository;
        this.currentUser = currentUser;
    }

    public SubscriptionStateResponse subscribe(Long channelId) {
        Long userId = currentUser.requireUserId();
        requireChannel(channelId);

        if (!subscriptionRepository.existsByUserIdAndChannelId(userId, channelId)) {
            subscriptionRepository.save(Subscription.of(userId, channelId));
            channelRepository.addSubscriberCount(channelId, 1);
        }
        return new SubscriptionStateResponse(true, subscriberCount(channelId));
    }

    public SubscriptionStateResponse unsubscribe(Long channelId) {
        Long userId = currentUser.requireUserId();
        requireChannel(channelId);

        int removed = subscriptionRepository.deleteByUserIdAndChannelId(userId, channelId);
        if (removed > 0) {
            channelRepository.addSubscriberCount(channelId, -1);
        }
        return new SubscriptionStateResponse(false, subscriberCount(channelId));
    }

    private void requireChannel(Long id) {
        if (!channelRepository.existsById(id)) {
            throw new ApiException(ErrorCode.CHANNEL_NOT_FOUND);
        }
    }

    private int subscriberCount(Long id) {
        return channelRepository.findById(id)
                .map(c -> c.getSubscriberCount())
                .orElseThrow(() -> new ApiException(ErrorCode.CHANNEL_NOT_FOUND));
    }
}
