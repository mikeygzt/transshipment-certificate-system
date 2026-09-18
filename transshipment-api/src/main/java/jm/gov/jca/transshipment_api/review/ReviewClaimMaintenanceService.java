package jm.gov.jca.transshipment_api.review;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jm.gov.jca.transshipment_api.transshipment_request.RequestStatus;
import jm.gov.jca.transshipment_api.transshipment_request.TransshipmentRequest;
import jm.gov.jca.transshipment_api.transshipment_request.TransshipmentRequestRepository;

/*
    If the page refreshed, the browser was closed, or internet connection was lost,
    requests which were under review would remain under review after being reloaded.
    This means the close() function never ran (which would update the status).

    Therefore, a claim timeout using a 'heartbeat' method was used.
    Whenever a request is claimed (opened) by a reviewer,
    it initalizes the reviewClaimedAt, and while the modal is opened,
    Angular sends a small 'heartbeat' periodically. This causes
    the reviewClaimedAt to be refreshed. Then, if a refresh/crash/internet loss
    happens, the heartbeat would stop. Once the backend notices the claim has been expired,
    it would revert the status back to 'SUBMITTED' and set the assignedReviewer to null.
    Then the open SSE connection tells the client to reload.

    tl;dr: the backend checks every 30 seconds for claims whose 'heartbeat' hasn't been
    updated for 90 seconds and releases them back to the queue.
*/

@Service 
public class ReviewClaimMaintenanceService {

    private static final long CLAIM_TIMEOUT_SECONDS = 90;

    private final TransshipmentRequestRepository transshipmentRequestRepository;
    private final ReviewQueueEventService reviewQueueEventService;

    public ReviewClaimMaintenanceService(
        TransshipmentRequestRepository transshipmentRequestRepository,
        ReviewQueueEventService reviewQueueEventService
    ) {
        this.transshipmentRequestRepository = transshipmentRequestRepository;
        this.reviewQueueEventService = reviewQueueEventService;
    }

    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void releaseStaleClaim() {
        Instant cutoff = Instant.now().minus(CLAIM_TIMEOUT_SECONDS, ChronoUnit.SECONDS);
        
        List<TransshipmentRequest> staleRequests = 
            transshipmentRequestRepository.findStaleReviewClaimsForUpdate(
                RequestStatus.UNDER_REVIEW,
                cutoff
            );
        
        if (staleRequests.isEmpty()) {
            return;
        }

        for (TransshipmentRequest request : staleRequests) {
            request.setStatus(RequestStatus.SUBMITTED);
            request.setAssignedReviewer(null);
            request.setReviewClaimedAt(null);
        }

        transshipmentRequestRepository.saveAll(staleRequests);
        reviewQueueEventService.notifyQueueChangedAfterCommit();
    }
}
