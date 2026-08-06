package kr.co.mbn.trot.content.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.content.domain.Content;
import kr.co.mbn.trot.content.domain.ContentPlace;
import kr.co.mbn.trot.content.domain.ContentType;
import kr.co.mbn.trot.content.dto.ContentResponse;
import kr.co.mbn.trot.content.dto.ContentSummaryResponse;
import kr.co.mbn.trot.content.repository.ContentPlaceRepository;
import kr.co.mbn.trot.content.repository.ContentRepository;
import kr.co.mbn.trot.place.dto.PlaceResponse;
import kr.co.mbn.trot.place.repository.PlaceRepository;
import kr.co.mbn.trot.reaction.domain.ReactionTargetType;
import kr.co.mbn.trot.reaction.repository.ReactionRepository;
import kr.co.mbn.trot.subscription.repository.SubscriptionRepository;

@Service
@Transactional(readOnly = true)
public class ContentService {

    private final ContentRepository contentRepository;
    private final ContentPlaceRepository contentPlaceRepository;
    private final PlaceRepository placeRepository;
    private final ReactionRepository reactionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserProvider currentUser;

    public ContentService(
            ContentRepository contentRepository,
            ContentPlaceRepository contentPlaceRepository,
            PlaceRepository placeRepository,
            ReactionRepository reactionRepository,
            SubscriptionRepository subscriptionRepository,
            CurrentUserProvider currentUser) {
        this.contentRepository = contentRepository;
        this.contentPlaceRepository = contentPlaceRepository;
        this.placeRepository = placeRepository;
        this.reactionRepository = reactionRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.currentUser = currentUser;
    }

    public PageResponse<ContentSummaryResponse> getContents(
            Long starId, ContentType type, Boolean live, Pageable pageable) {

        Page<Content> page;
        if (type == null && live == null) {
            page = contentRepository.findByStarIdOrderByPublishedAtDesc(starId, pageable);
        } else if (type == null) {
            page = contentRepository.findByStarIdAndLiveOrderByPublishedAtDesc(starId, live, pageable);
        } else if (live == null) {
            page = contentRepository.findByStarIdAndTypeOrderByPublishedAtDesc(starId, type, pageable);
        } else {
            page = contentRepository.findByStarIdAndTypeAndLiveOrderByPublishedAtDesc(
                    starId, type, live, pageable);
        }
        return PageResponse.from(page, ContentSummaryResponse::from);
    }

    public ContentResponse getContent(Long id) {
        Content content = contentRepository.findWithChannelById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.CONTENT_NOT_FOUND));

        Optional<Long> userId = currentUser.findUserId();

        boolean liked = userId
                .map(uid -> reactionRepository.existsByUserIdAndTargetTypeAndTargetId(
                        uid, ReactionTargetType.CONTENT, id))
                .orElse(false);

        boolean subscribed = userId
                .map(uid -> subscriptionRepository.existsByUserIdAndChannelId(
                        uid, content.getChannel().getId()))
                .orElse(false);

        return ContentResponse.from(content, liked, subscribed, findPlaces(id));
    }

    /** 뉴스 상세 하단 "기사에 나온 그 곳". 영상이면 보통 비어 있습니다. */
    private List<PlaceResponse> findPlaces(Long contentId) {
        List<Long> placeIds = contentPlaceRepository.findByContentIdOrderBySortOrderAsc(contentId)
                .stream()
                .map(ContentPlace::getPlaceId)
                .toList();

        if (placeIds.isEmpty()) {
            return List.of();
        }
        return placeRepository.findByIdInOrderByIdAsc(placeIds).stream()
                .map(PlaceResponse::from)
                .toList();
    }

    /** 상세 화면 하단 "관련 콘텐츠 / 관련 영상". */
    public List<ContentSummaryResponse> getRelated(Long id, int limit) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.CONTENT_NOT_FOUND));

        return contentRepository
                .findByStarIdAndIdNotOrderByPublishedAtDesc(
                        content.getStarId(), id, PageRequest.of(0, limit))
                .stream()
                .map(ContentSummaryResponse::from)
                .toList();
    }

    /** HOME 집계용 — 기사·영상을 섞어서 최신 10건. */
    public List<ContentSummaryResponse> findLatest(Long starId) {
        return contentRepository.findTop10ByStarIdOrderByPublishedAtDesc(starId).stream()
                .map(ContentSummaryResponse::from)
                .toList();
    }
}
