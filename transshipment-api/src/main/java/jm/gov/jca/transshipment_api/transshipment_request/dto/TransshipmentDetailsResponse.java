package jm.gov.jca.transshipment_api.transshipment_request.dto;

import java.time.OffsetDateTime;

import jm.gov.jca.transshipment_api.transshipment_request.RequestStatus;
import jm.gov.jca.transshipment_api.user.UserAccount;

public record TransshipmentDetailsResponse(
    UserAccount requesterUserId,
    String shippingAgentName,
    String agentCodeJca,
    String trn,
    String applicantName,
    String emailAddress,
    String phoneNumber,
    String requestType,
    String portTerminal,
    String purposeOfCertificate,
    String inboundVoyageNo,
    String inboundVesselName,
    OffsetDateTime dateOfArrival,
    String outboundVoyageNumber,
    String outboundVesselName,
    OffsetDateTime expectedDepartureDate,
    String manifestNumber,
    String billOfLadingWaybill,
    String rotationCallReference,
    String remarksInstructions,
    RequestStatus status,
    String reviewComments,
    String pdfCertificatePath

) {    
}
