package kr.co.mbn.trot.home.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.home.dto.HomeResponse;
import kr.co.mbn.trot.home.dto.PlayResponse;
import kr.co.mbn.trot.home.service.HomeService;

@RestController
@RequestMapping("/api/v1/stars")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @GetMapping("/{starId}/home")
    public HomeResponse getHome(@PathVariable Long starId) {
        return homeService.getHome(starId);
    }

    @GetMapping("/{starId}/play")
    public PlayResponse getPlay(@PathVariable Long starId) {
        return homeService.getPlay(starId);
    }
}
