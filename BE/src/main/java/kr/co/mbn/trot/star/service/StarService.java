package kr.co.mbn.trot.star.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.star.domain.Star;
import kr.co.mbn.trot.star.dto.StarResponse;
import kr.co.mbn.trot.star.repository.StarRepository;

@Service
@Transactional(readOnly = true)
public class StarService {

    private final StarRepository starRepository;

    public StarService(StarRepository starRepository) {
        this.starRepository = starRepository;
    }

    public StarResponse getStar(Long starId) {
        return StarResponse.from(getStarEntity(starId));
    }

    /** 다른 도메인 서비스에서 스타 존재를 검증할 때 사용합니다. */
    public Star getStarEntity(Long starId) {
        return starRepository.findById(starId)
                .orElseThrow(() -> new ApiException(ErrorCode.STAR_NOT_FOUND));
    }
}
