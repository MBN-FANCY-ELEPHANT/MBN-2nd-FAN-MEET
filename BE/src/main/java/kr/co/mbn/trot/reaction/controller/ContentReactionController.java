package kr.co.mbn.trot.reaction.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.mbn.trot.reaction.dto.LikeStateResponse;
import kr.co.mbn.trot.reaction.service.ReactionService;

@RestController
@RequestMapping("/api/v1/contents/{id}/like")
public class ContentReactionController {

    private final ReactionService reactionService;

    public ContentReactionController(ReactionService reactionService) {
        this.reactionService = reactionService;
    }

    @PostMapping
    public LikeStateResponse like(@PathVariable Long id) {
        return reactionService.likeContent(id);
    }

    @DeleteMapping
    public LikeStateResponse unlike(@PathVariable Long id) {
        return reactionService.unlikeContent(id);
    }
}
