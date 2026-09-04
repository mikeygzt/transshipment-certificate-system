package jm.gov.jca.transshipment_api.transshipment_certificate;

public record CertificateContainerData(
    String containerNumber,
    String sealNumber,
    String sizeType,
    String cargoDescription,
    Integer packages,
    String grossWeight
) {}
