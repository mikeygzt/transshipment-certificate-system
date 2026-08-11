package jm.gov.jca.transshipment_api.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jm.gov.jca.transshipment_api.user.Role;

public record AdminUpdateUserRequest(

    @Size(max = 100, message = "Full name must not exceed 100 characters")
    String fullName,
    
    @Email
    String email,

    String telephone,

    String companyTRN,

    String shippingAgentName,

    Role role
) {
}
