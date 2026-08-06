package kr.co.mbn.trot.place.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.place.domain.PlaceType;
import kr.co.mbn.trot.place.dto.PlaceResponse;
import kr.co.mbn.trot.place.service.PlaceService;

@RestController
@RequestMapping("/api/v1/places")
public class PlaceController {

    private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @GetMapping
    public PageResponse<PlaceResponse> getPlaces(
            @RequestParam Long starId,
            @RequestParam(required = false) PlaceType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return placeService.getPlaces(starId, type, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public PlaceResponse getPlace(@PathVariable Long id) {
        return placeService.getPlace(id);
    }
}
