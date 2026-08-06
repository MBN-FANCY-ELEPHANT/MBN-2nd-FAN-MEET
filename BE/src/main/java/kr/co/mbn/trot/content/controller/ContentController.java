package kr.co.mbn.trot.content.controller;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.content.domain.ContentType;
import kr.co.mbn.trot.content.dto.ContentResponse;
import kr.co.mbn.trot.content.dto.ContentSummaryResponse;
import kr.co.mbn.trot.content.service.ContentService;

@RestController
@RequestMapping("/api/v1/contents")
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping
    public PageResponse<ContentSummaryResponse> getContents(
            @RequestParam Long starId,
            @RequestParam(required = false) ContentType type,
            @RequestParam(required = false) Boolean live,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return contentService.getContents(starId, type, live, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ContentResponse getContent(@PathVariable Long id) {
        return contentService.getContent(id);
    }

    @GetMapping("/{id}/related")
    public List<ContentSummaryResponse> getRelated(
            @PathVariable Long id,
            @RequestParam(defaultValue = "6") int limit) {

        return contentService.getRelated(id, Math.min(limit, 20));
    }
}
