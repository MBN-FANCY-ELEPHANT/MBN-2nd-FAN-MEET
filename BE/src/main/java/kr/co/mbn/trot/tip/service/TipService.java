package kr.co.mbn.trot.tip.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.tip.domain.Tip;
import kr.co.mbn.trot.tip.domain.TipCategory;
import kr.co.mbn.trot.tip.dto.TipResponse;
import kr.co.mbn.trot.tip.dto.TipSummaryResponse;
import kr.co.mbn.trot.tip.repository.TipRepository;

@Service
@Transactional(readOnly = true)
public class TipService {

    private final TipRepository tipRepository;

    public TipService(TipRepository tipRepository) {
        this.tipRepository = tipRepository;
    }

    public PageResponse<TipSummaryResponse> getTips(
            Long starId, TipCategory category, Pageable pageable) {

        Page<Tip> page = (category == null)
                ? tipRepository.findByStarIdOrderByUpdatedAtDesc(starId, pageable)
                : tipRepository.findByStarIdAndCategoryOrderByUpdatedAtDesc(starId, category, pageable);

        return PageResponse.from(page, TipSummaryResponse::from);
    }

    public TipResponse getTip(Long id) {
        return tipRepository.findById(id)
                .map(TipResponse::from)
                .orElseThrow(() -> new ApiException(ErrorCode.TIP_NOT_FOUND));
    }

    /** PLAY 집계용 — 응원하기 2열 그리드. */
    public List<TipSummaryResponse> findForPlay(Long starId) {
        return tipRepository.findTop6ByStarIdOrderByUpdatedAtDesc(starId).stream()
                .map(TipSummaryResponse::from)
                .toList();
    }
}
