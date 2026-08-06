package kr.co.mbn.trot.subscription.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.subscription.dto.SubscriptionStateResponse;
import kr.co.mbn.trot.subscription.service.SubscriptionService;

@RestController
@RequestMapping("/api/v1/channels/{id}/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping
    public SubscriptionStateResponse subscribe(@PathVariable Long id) {
        return subscriptionService.subscribe(id);
    }

    @DeleteMapping
    public SubscriptionStateResponse unsubscribe(@PathVariable Long id) {
        return subscriptionService.unsubscribe(id);
    }
}
