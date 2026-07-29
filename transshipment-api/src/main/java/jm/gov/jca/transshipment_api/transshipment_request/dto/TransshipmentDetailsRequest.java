package jm.gov.jca.transshipment_api.transshipment_request.dto;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jm.gov.jca.transshipment_api.transshipment_request.RequestStatus;
import jm.gov.jca.transshipment_api.user.UserAccount;

public record TransshipmentDetailsRequest(

    UserAccount requesterUserId,
    
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
    
    @NotBlank
    String inboundVesselName,
    
    @NotBlank
    OffsetDateTime dateOfArrival,
    
    @NotBlank
    @Size(max = 100)
    String outboundVoyageNumber,
    
    @NotBlank
    String outboundVesselName,
    
    @NotBlank
    OffsetDateTime expectedDepartureDate,
    
    @NotBlank
    String manifestNumber,
    
    @NotBlank
    String billOfLadingWaybill,

    String rotationCallReference,

    String remarksInstructions,

    @NotBlank
    RequestStatus status,

    String reviewComments,

    String pdfCertificatePath
) {
 
}
