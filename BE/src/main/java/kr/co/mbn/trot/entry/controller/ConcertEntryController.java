package kr.co.mbn.trot.entry.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.entry.dto.ConcertEntryResponse;
import kr.co.mbn.trot.entry.service.ConcertEntryService;

/**
 * 공연 응모 API.
 *
 * <p>⚠️ <b>{@code POST} 에 요청 본문이 없습니다.</b> 응모는 1회 1매 고정이라 매수 파라미터를
 * 두지 않습니다. 본문을 추가하려거든 먼저 {@code docs/api-spec.yaml} 을 고치세요.
 */
@RestController
@RequestMapping("/api/v1")
public class ConcertEntryController {

    private final ConcertEntryService entryService;
    private final CurrentUserProvider currentUser;

    public ConcertEntryController(
            ConcertEntryService entryService, CurrentUserProvider currentUser) {
        this.entryService = entryService;
        this.currentUser = currentUser;
    }

    @GetMapping("/schedules/{id}/entry")
    public ConcertEntryResponse getEntry(@PathVariable Long id) {
        return entryService.getEntryState(id, currentUser.findUserId().orElse(null));
    }

    @PostMapping("/schedules/{id}/entry")
    @ResponseStatus(HttpStatus.CREATED)
    public ConcertEntryResponse enter(@PathVariable Long id) {
        return entryService.enter(id, currentUser.requireUserId());
    }

    @DeleteMapping("/schedules/{id}/entry")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable Long id) {
        entryService.cancel(id, currentUser.requireUserId());
    }

    @GetMapping("/entries")
    public List<ConcertEntryResponse> listEntries(@RequestParam Long starId) {
        return entryService.listMine(starId, currentUser.findUserId().orElse(null));
    }
}
