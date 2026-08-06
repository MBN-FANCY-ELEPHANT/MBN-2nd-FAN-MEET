package kr.co.mbn.trot.tip.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.tip.domain.TipCategory;
import kr.co.mbn.trot.tip.dto.TipResponse;
import kr.co.mbn.trot.tip.dto.TipSummaryResponse;
import kr.co.mbn.trot.tip.service.TipService;

@RestController
@RequestMapping("/api/v1/tips")
public class TipController {

    private final TipService tipService;

    public TipController(TipService tipService) {
        this.tipService = tipService;
    }

    @GetMapping
    public PageResponse<TipSummaryResponse> getTips(
            @RequestParam Long starId,
            @RequestParam(required = false) TipCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return tipService.getTips(starId, category, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public TipResponse getTip(@PathVariable Long id) {
        return tipService.getTip(id);
    }
}
