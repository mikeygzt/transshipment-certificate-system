export type RequestStatus ="SUBMITTED" |"UNDER_REVIEW"|"APPROVED"|"REJECTED"|"RESUBMITTED";

export interface ContainerDetailsRequest {
    containerId: string;
    requestId: string;
    containerNumber: string | null;
    sealNumber: string | null  | null;
    sizeType: string  | null;
    cargoDescription: string | null;
    packages: number | null;
    grossWeightKg: number | null;
    yardLocation: string | null;
    origin: string | null;
    finalDestination: string | null;
}

export interface ContainerDetailsResponse {
    containerId: string ;
    requestId: string;
    containerNumber: string  | null;
    sealNumber: string | null;
    sizeType: string  | null;
    cargoDescription: string | null;
    packages: number | null;
    grossWeightKg: number  | null;
    yardLocation: string | null;
    origin: string | null;
    finalDestination: string  | null;
}

export interface Transshipmentrequest {
    requestId: string;
    requesterUserId: string;
    shippingAgentName: string | null;
    agentCodeJca: string | null;
    trn: string | null;
    applicantName: string | null;
    emailAddress: string | null;
    phoneNumber: string | null;
    requestType: string | null;
    portTerminal: string | null;
    purposeOfCertificate: string | null;
    inboundVoyageNo: string | null;
    inboundVesselName: string | null;
    dateOfArrival: string | null;
    outboundVoyageNumber: string | null;
    outboundVesselName: string | null;
    expectedDepartureDate: string | null;
    manifestNumber: string | null;
    billOfLadingWaybill: string | null;
    rotationCallReference: string | null;
    remarksInstructions: string | null;
    status: RequestStatus;
    reviewComments: string  | null;
    pdfCertificatePath: string  | null;
    containers: ContainerDetailsRequest[];
}

export interface TransshipmentResponse {
    requestId: string;
    requesterUserId: string;
    shippingAgentName: string | null;
    agentCodeJca: string | null;
    trn: string | null;
    applicantName: string | null;
    emailAddress: string | null;
    phoneNumber: string | null;
    requestType: string |null;
    portTerminal: string | null;
    purposeOfCertificate: string |null;
    inboundVoyageNo: string | null;
    inboundVesselName: string | null;
    dateOfArrival: string | null;
    outboundVoyageNumber: string | null;
    outboundVesselName: string | null;
    expectedDepartureDate: string | null;
    manifestNumber: string | null;
    billOfLadingWaybill: string | null;
    rotationCallReference: string | null;
    remarksInstructions: string | null;
    status: RequestStatus;
    reviewComments: string | null;
    pdfCertificatePath: string | null;
    containers: ContainerDetailsResponse[];
    createdAt: string;
}