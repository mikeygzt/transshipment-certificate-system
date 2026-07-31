package jm.gov.jca.transshipment_api.transshipment_request;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;



 public interface TransshipmentRequestRepository extends JpaRepository<TransshipmentRequest,UUID> {

    Optional<TransshipmentRequest> findByRequesterId(UUID id);
    
    
    
}
