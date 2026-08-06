package kr.co.mbn.trot.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.subscription.domain.Subscription;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    boolean existsByUserIdAndChannelId(Long userId, Long channelId);

    int deleteByUserIdAndChannelId(Long userId, Long channelId);
}
