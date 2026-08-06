package kr.co.mbn.trot.reaction.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.reaction.domain.Reaction;
import kr.co.mbn.trot.reaction.domain.ReactionTargetType;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    boolean existsByUserIdAndTargetTypeAndTargetId(
            Long userId, ReactionTargetType targetType, Long targetId);

    /** 삭제 건수를 돌려주므로 "실제로 취소됐는지"를 조회 없이 알 수 있습니다. */
    int deleteByUserIdAndTargetTypeAndTargetId(
            Long userId, ReactionTargetType targetType, Long targetId);

    /** 댓글 목록에서 내가 좋아요한 항목을 한 번에 판별합니다 (N+1 방지). */
    List<Reaction> findByUserIdAndTargetTypeAndTargetIdIn(
            Long userId, ReactionTargetType targetType, List<Long> targetIds);
}
