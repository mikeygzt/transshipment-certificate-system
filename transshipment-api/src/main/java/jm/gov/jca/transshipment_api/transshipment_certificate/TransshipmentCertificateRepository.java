package jm.gov.jca.transshipment_api.transshipment_certificate;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TransshipmentCertificateRepository extends JpaRepository<TransshipmentCertificate, UUID>{

    Optional<TransshipmentCertificate> findByRequestRequestId(UUID request);

    boolean existsByRequestRequestId(UUID requestId);

    Optional<TransshipmentCertificate> findByControlNumber(String controlNumber);
}
