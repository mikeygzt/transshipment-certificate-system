package jm.gov.jca.transshipment_api.transshipment_request.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ContainerDetailsResponse(
        UUID containerId,
        UUID requestId,
        String containerNumber,
        String sealNumber,
        String sizeType,
        String cargoDescription,
        int packages,
        BigDecimal grossWeightKg,
        String yardLocation,
        String origin,
        String finalDestination
) {

}