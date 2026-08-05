package jm.gov.jca.transshipment_api.transshipment_request.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jm.gov.jca.transshipment_api.transshipment_request.RequestStatus;
import jm.gov.jca.transshipment_api.user.UserAccount;

public record TransshipmentDetailsRequest(
    UUID requestId,

    //Swap to UUID once datetime issue is resolved
    UUID requesterUserId,
    
    String shippingAgentName,
    
    String agentCodeJca,
    
    String trn,
    
    String applicantName,
    
    String emailAddress,
    
    String phoneNumber,

    @NotBlank
    String requestType,
    
    @NotBlank
    String portTerminal,

    @NotBlank
    String purposeOfCertificate,
    
    @NotBlank
    @Size(max = 100)
    String inboundVoyageNo,

    String inboundVesselName,

    LocalDate dateOfArrival,
    
    @NotBlank
    @Size(max = 100)
    String outboundVoyageNumber,
    
    @NotBlank
    String outboundVesselName,

    LocalDate expectedDepartureDate,
    
    @NotBlank
    String manifestNumber,
    
    @NotBlank
    String billOfLadingWaybill,

    String rotationCallReference,

    String remarksInstructions,

    RequestStatus status,

    String reviewComments,

    String pdfCertificatePath
) {
    
}
