package jm.gov.jca.transshipment_api.transshipment_certificate;

import java.time.LocalDate;
import java.util.List;

public record CertificateData (
    String controlNumber,
    LocalDate issueDate,

    String applicantName,
    String shippingAgentName,
    String agentCode,
    String trnTin,

    String portTerminal,
    String purpose,

    String inboundVessel,
    String inboundVoyage,
    LocalDate dateOfArrival,

    String outboundVessel,
    String outboundVoyage,
    LocalDate departureDate,

    String manifestNumber,
    String billOfLadingWayBill,

    String controlCheckReference,
    String verificationStatus,

    List<CertificateContainerData> containers,

    String officerNotes
) {}
