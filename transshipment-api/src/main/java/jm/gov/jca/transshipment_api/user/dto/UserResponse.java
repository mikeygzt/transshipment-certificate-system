package jm.gov.jca.transshipment_api.user.dto;

import jm.gov.jca.transshipment_api.user.Role;
import jm.gov.jca.transshipment_api.user.Status;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserResponse (
    UUID id,
    String fullName,
    String telephone,
    String companyTRN,
    String shippingAgentName,
    String email,
    Role role,
    Status status,
    OffsetDateTime createdAt
) {
    
}
