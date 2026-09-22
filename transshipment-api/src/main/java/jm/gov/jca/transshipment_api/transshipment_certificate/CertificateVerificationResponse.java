package jm.gov.jca.transshipment_api.transshipment_certificate;

import java.time.LocalDateTime;

public record CertificateVerificationResponse(
    String controlNumber,
    String status,
    LocalDateTime issuedAt
) {}
