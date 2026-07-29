package jm.gov.jca.transshipment_api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailRequest (
    @NotBlank
    @Email
    String email,

    // Regex expression represents exactly six digits
    @NotBlank
    @Pattern(regexp = "\\d{6}")
    String code
) {}
