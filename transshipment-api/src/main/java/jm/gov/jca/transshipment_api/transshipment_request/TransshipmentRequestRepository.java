package jm.gov.jca.transshipment_api.transshipment_request;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TransshipmentRequestRepository extends JpaRepository<TransshipmentRequest,Long> {

    Optional<TransshipmentRequest> findByRequesterId(Long id);
    
    
}
