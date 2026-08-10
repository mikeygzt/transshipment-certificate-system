export type RequestStatus ="SUBMITTED" |"UNDER_REVIEW"|"APPROVED"|"REJECTED"|"RESUBMITTED";

export interface ContainerDetailsRequest {
    containerId: string;
    requestId: string;
    containerNumber: string;
    sealNumber: string;
    sizeType: string;
    cargoDescription: string;
    packages: number;
    grossWeightKg: number;
    yardLocation: string;
    origin: string;
    finalDestination: string;
}

export interface ContainerDetailsResponse {
    containerId: string;
    requestId: string;
    containerNumber: string;
    sealNumber: string;
    sizeType: string;
    cargoDescription: string;
    packages: number;
    grossWeightKg: number;
    yardLocation: string;
    origin: string;
    finalDestination: string;
}

export interface Transshipmentrequest {
    requestId: string;
    requesterUserId: string;
    shippingAgentName: string;
    agentCodeJca: string;
    trn: string;
    applicantName: string;
    emailAddress: string;
    phoneNumber: string;
    requestType: string;
    portTerminal: string;
    purposeOfCertificate: string;
    inboundVoyageNo: string;
    inboundVesselName: string;
    dateOfArrival: string;
    outboundVoyageNumber: string;
    outboundVesselName: string;
    expectedDepartureDate: string;
    manifestNumber: string;
    billOfLadingWaybill: string;
    rotationCallReference: string;
    remarksInstructions: string;
    status: RequestStatus;
    reviewComments: string;
    pdfCertificatePath: string;
    containers: ContainerDetailsRequest[];
}

export interface TransshipmentResponse {
    requestId: string;
    requesterUserId: string;
    shippingAgentName: string;
    agentCodeJca: string;
    trn: string;
    applicantName: string;
    emailAddress: string;
    phoneNumber: string;
    requestType: string;
    portTerminal: string;
    purposeOfCertificate: string;
    inboundVoyageNo: string;
    inboundVesselName: string;
    dateOfArrival: string;
    outboundVoyageNumber: string;
    outboundVesselName: string;
    expectedDepartureDate: string;
    manifestNumber: string;
    billOfLadingWaybill: string;
    rotationCallReference: string;
    remarksInstructions: string;
    status: RequestStatus;
    reviewComments: string;
    pdfCertificatePath: string;
    containers: ContainerDetailsResponse[];
}