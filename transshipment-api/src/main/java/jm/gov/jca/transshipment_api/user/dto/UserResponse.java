package jm.gov.jca.transshipment_api.user.dto;

import jm.gov.jca.transshipment_api.user.Role;
import jm.gov.jca.transshipment_api.user.Status;

import java.time.OffsetDateTime;

public record UserResponse (
    Long id,
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
