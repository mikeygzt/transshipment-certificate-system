package jm.gov.jca.transshipment_api.transshipment_request;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContainerDetailsRepository extends JpaRepository<ContainerDetails, UUID> {
    Optional<ContainerDetails> findById(UUID containerId);

    List<ContainerDetails> findByRequestRequestId(UUID requestId);

}
