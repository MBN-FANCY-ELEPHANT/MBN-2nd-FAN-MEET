package kr.co.mbn.trot.schedule.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.schedule.domain.ScheduleType;
import kr.co.mbn.trot.schedule.dto.ScheduleResponse;
import kr.co.mbn.trot.schedule.service.ScheduleService;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public PageResponse<ScheduleResponse> getSchedules(
            @RequestParam Long starId,
            @RequestParam(defaultValue = "true") boolean upcoming,
            @RequestParam(required = false) ScheduleType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return scheduleService.getSchedules(starId, upcoming, type, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ScheduleResponse getSchedule(@PathVariable Long id) {
        return scheduleService.getSchedule(id);
    }
}
