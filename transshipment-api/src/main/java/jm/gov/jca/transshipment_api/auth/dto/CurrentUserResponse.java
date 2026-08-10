package jm.gov.jca.transshipment_api.auth.dto;

import java.util.UUID;

import jm.gov.jca.transshipment_api.user.Role;
import jm.gov.jca.transshipment_api.user.Status;

public record CurrentUserResponse(
    UUID id,
    String fullName,
    String telephone,
    String companyTRN,
    String shippingAgentName,
    String email,
    Role role,
    Status status
){}
