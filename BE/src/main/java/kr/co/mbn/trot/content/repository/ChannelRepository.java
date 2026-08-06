package kr.co.mbn.trot.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.co.mbn.trot.content.domain.Channel;

public interface ChannelRepository extends JpaRepository<Channel, Long> {

    /** 구독자 수는 원자적 UPDATE 로만 변경합니다. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Channel c set c.subscriberCount = c.subscriberCount + :delta where c.id = :id")
    void addSubscriberCount(@Param("id") Long id, @Param("delta") int delta);
}
