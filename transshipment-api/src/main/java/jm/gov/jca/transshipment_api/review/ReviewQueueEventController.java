package jm.gov.jca.transshipment_api.review;

import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

// This controller tells the service to create the SSE connection when the browser wants one
// Only the review-queue page works with SSE 
@RestController
@RequestMapping("/api/reviewer/review-queue")
public class ReviewQueueEventController {
    private final ReviewQueueEventService reviewQueueEventService;

    public ReviewQueueEventController(ReviewQueueEventService reviewQueueEventService) {
        this.reviewQueueEventService = reviewQueueEventService;
    }

    @PreAuthorize("hasRole('REVIEWER')")
    @GetMapping(
        value = "/events",
        produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )

    public SseEmitter subscribe() {
        return reviewQueueEventService.subscribe(); 
    }
}
