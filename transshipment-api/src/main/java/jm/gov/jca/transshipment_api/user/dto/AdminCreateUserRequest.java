package jm.gov.jca.transshipment_api.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jm.gov.jca.transshipment_api.user.Role;
import jm.gov.jca.transshipment_api.user.Status;

public record AdminCreateUserRequest (
    
    @NotBlank
    String fullName,

    @NotBlank
    @Size(max = 12)
    String telephone,

    @NotBlank
    @Size(max = 13)
    String companyTRN,

    @NotBlank
    String shippingAgentName,
    
    @NotBlank
    @Email
    String email,

    @NotBlank
    @Size(min = 12, max = 128)
    String password,

    @NotNull
    Role role,

    @NotNull
    Status status
){
    
}
