package jm.gov.jca.transshipment_api.transshipment_request.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContainerDetailsRequest(

        UUID containerId,

        UUID requestId,

        @NotBlank
        @Size(max = 20)
        String containerNumber,

        @Size(max = 50)
        String sealNumber,

        @NotBlank
        @Size(max = 50)
        String sizeType,

        String cargoDescription,

        int packages,

        BigDecimal grossWeightKg,

        @Size(max = 100)
        String yardLocation,

        @Size(max = 100)
        String origin,

        @Size(max = 100)
        String finalDestination

) {
}