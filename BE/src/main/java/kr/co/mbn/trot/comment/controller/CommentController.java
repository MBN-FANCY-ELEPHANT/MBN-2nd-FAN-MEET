package kr.co.mbn.trot.comment.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import kr.co.mbn.trot.comment.dto.CommentCreateRequest;
import kr.co.mbn.trot.comment.dto.CommentResponse;
import kr.co.mbn.trot.comment.dto.CommentTranslationResponse;
import kr.co.mbn.trot.comment.service.CommentService;
import kr.co.mbn.trot.common.dto.PageResponse;
import kr.co.mbn.trot.reaction.dto.LikeStateResponse;
import kr.co.mbn.trot.reaction.service.ReactionService;
import kr.co.mbn.trot.user.domain.Locale;

@RestController
@RequestMapping("/api/v1")
public class CommentController {

    private final CommentService commentService;
    private final ReactionService reactionService;

    public CommentController(CommentService commentService, ReactionService reactionService) {
        this.commentService = commentService;
        this.reactionService = reactionService;
    }

    @GetMapping("/contents/{id}/comments")
    public PageResponse<CommentResponse> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return commentService.getComments(id, PageRequest.of(page, size));
    }

    @PostMapping("/contents/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse createComment(
            @PathVariable Long id, @Valid @RequestBody CommentCreateRequest request) {

        return commentService.create(id, request.body());
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long id) {
        commentService.delete(id);
    }

    @PostMapping("/comments/{id}/like")
    public LikeStateResponse likeComment(@PathVariable Long id) {
        return reactionService.likeComment(id);
    }

    @DeleteMapping("/comments/{id}/like")
    public LikeStateResponse unlikeComment(@PathVariable Long id) {
        return reactionService.unlikeComment(id);
    }

    @GetMapping("/comments/{id}/translation")
    public CommentTranslationResponse translateComment(
            @PathVariable Long id,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage) {

        return commentService.translate(id, Locale.fromTagOrDefault(acceptLanguage));
    }
}
