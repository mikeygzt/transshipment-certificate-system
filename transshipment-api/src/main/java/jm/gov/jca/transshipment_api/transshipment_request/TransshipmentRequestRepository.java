package jm.gov.jca.transshipment_api.transshipment_request;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;



 public interface TransshipmentRequestRepository extends JpaRepository<TransshipmentRequest,UUID> {

    Optional<TransshipmentRequest> findById(UUID requestId);

    List<TransshipmentRequest> findByRequesterUserIdId(UUID userId);
    
    // This is so that another review cannot simultaneously slip through the same status check
    // while an inital reviewer is claiming the request
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT r
            FROM TransshipmentRequest r
            WHERE r.requestId = :requestId
            """)
    Optional<TransshipmentRequest> findByRequestIdForUpdate(
        @Param("requestId") UUID requestId
    );

    // Finding stale request claims by determining if the time it was claimed is before the cuttoff.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT r
            FROM TransshipmentRequest r
            WHERE r.status = :status
                AND r.reviewClaimedAt IS NOT NULL
                AND r.reviewClaimedAt < :cutoff
            """)
    List<TransshipmentRequest> findStaleReviewClaimsForUpdate(
        @Param("status") RequestStatus status,
        @Param("cutoff") Instant cutoff
    );
    
    
}
