package kr.co.mbn.trot.search.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.search.dto.SearchResponse;
import kr.co.mbn.trot.search.service.SearchService;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public SearchResponse search(
            @RequestParam Long starId,
            @RequestParam String q,
            @RequestParam(defaultValue = "5") int limitPerCategory) {

        return searchService.search(starId, q, Math.min(limitPerCategory, 20));
    }
}
