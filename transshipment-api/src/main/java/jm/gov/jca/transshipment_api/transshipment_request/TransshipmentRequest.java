package jm.gov.jca.transshipment_api.transshipment_request;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.util.UUID;
/*import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;*/
import jm.gov.jca.transshipment_api.user.UserAccount;

//Structure for the Transhipment_Requests Table
@Entity
@Table(name ="transhipment_requests")
public class TransshipmentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID requestId;

    @ManyToOne(optional = false)
    @JoinColumn(
        nullable = false,
        name = "requester_user_id"
    )
    private UserAccount requesterUserId;

    @Column(
        nullable = false,
        length = 255,
        name = "shipping_agent_name"
    )
    private String shippingAgentName;

    @Column(
        nullable = true,
        length = 100,
        name = "agent_code_jca"
    )
    private String agentCodeJca;

    @Column(
        nullable = false,
        length=13,
        name= "trn"
    )
    private String trn;

    @Column(
        nullable = false,
        length = 255,
        name ="applicant_name"
    )
    private String applicantName;

    @Column(
        nullable = false,
        length =255,
        name = "email_address"
    )
    private String emailAddress;

    @Column(
        nullable = false,
        length = 25,
        name = "phone_number"
    )
    private String phoneNumber; //submitter phone number

    @Column(
        nullable = false,
        length = 100,
        name = "request_type"
    )
    private String requestType;

    @Column(
        nullable = false,
        length = 100,
        name = "port_terminal"
    )
    private String portTerminal;

    @Column(
        nullable = false,
        length = 255,
        name = "purpose_of_certificate"
    )
    private String purposeOfCertificate;

    @Column(
        nullable = false,
        length = 100,
        name = "inbound_voyage_no"
    )
    private String inboundVoyageNo;

    @Column(
        nullable = false,
        length = 255,
        name = "inbound_vessel_name"
    )
    private String inboundVesselName;

    @Column(
        nullable = false,
        name = "date of arrival"
    )
    private LocalDate dateOfArrival;

    @Column(
        nullable = false,
        length = 100,
        name = "outbound_voyage_no"
    )
    private String outboundVoyageNumber;

    @Column(
        nullable = false,
        length = 255,
        name = "outbound_vessel_name"
    )
    private String outboundVesselName;

    @Column(
        nullable = false,
        name = "expected_departure_date"
    )
    private LocalDate expectedDepartureDate;

    @Column(
        nullable = false,
        length = 100,
        name = "manifest_number"
    )
    private String manifestNumber;

    @Column(
        nullable = false,
        length = 100,
        name = "bill_of_lading_waybill"
    )
    private String billOfLadingWaybill;

    @Column(
        nullable = true,
        length = 100,
        name = "rotation_call_reference"
    )
    private String rotationCallReference;

    @Column(
        nullable = true,
        length = 512,
        columnDefinition = "TEXT",
        name = "remarks_instructions"
    )
    private String remarksInstructions;

    @Column(
        nullable = false,
        length = 50,
        name = "status"
    )
    private RequestStatus status;

    @Column(
        nullable = true,
        length = 512,
        columnDefinition = "TEXT",
        name = "review_comments"
    )
    private String reviewComments;

    @Column(
        nullable = true,
        length = 500,
        name = "pdf_certificate_path"
    )
    private String pdfCertificatePath;

    @CreationTimestamp
    @Column(
        nullable = false,
        name = "created_at"
    )
    private Instant createdAt;

    
    @UpdateTimestamp
    @Column(
        nullable = false,
        name = "updated_at"
    )
    private Instant updatedAt;

    protected  TransshipmentRequest(){}
    
    public TransshipmentRequest(
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
    LocalDate dateOfArrival,
    String outboundVoyageNumber,
    String outboundVesselName,
    LocalDate expectedDepartureDate,
    String manifestNumber,
    String billOfLadingWaybill,
    String rotationCallReference,
    String remarksInstructions,
    String reviewComments,
    String pdfCertificatePath
) {
    this.requesterUserId = requesterUserId;
    this.shippingAgentName = shippingAgentName;
    this.agentCodeJca = agentCodeJca;
    this.trn = trn;
    this.applicantName = applicantName;
    this.emailAddress = emailAddress;
    this.phoneNumber = phoneNumber;
    this.requestType = requestType;
    this.portTerminal = portTerminal;
    this.purposeOfCertificate = purposeOfCertificate;
    this.inboundVoyageNo = inboundVoyageNo;
    this.inboundVesselName = inboundVesselName;
    this.dateOfArrival = dateOfArrival;
    this.outboundVoyageNumber = outboundVoyageNumber;
    this.outboundVesselName = outboundVesselName;
    this.expectedDepartureDate = expectedDepartureDate;
    this.manifestNumber = manifestNumber;
    this.billOfLadingWaybill = billOfLadingWaybill;
    this.rotationCallReference = rotationCallReference;
    this.remarksInstructions = remarksInstructions;
    this.reviewComments = reviewComments;
    this.pdfCertificatePath = pdfCertificatePath;
}

public UUID getRequestId() {
    return requestId;
}

public UserAccount getRequesterUserId() {
    return requesterUserId;
}

public String getShippingAgentName() {
    return shippingAgentName;
}

public String getAgentCodeJca() {
    return agentCodeJca;
}

public String getTrn() {
    return trn;
}

public String getApplicantName() {
    return applicantName;
}

public String getEmailAddress() {
    return emailAddress;
}

public String getPhoneNumber() {
    return phoneNumber;
}

public String getRequestType() {
    return requestType;
}

public String getPortTerminal() {
    return portTerminal;
}

public String getPurposeOfCertificate() {
    return purposeOfCertificate;
}

public String getInboundVoyageNo() {
    return inboundVoyageNo;
}

public String getInboundVesselName() {
    return inboundVesselName;
}

public LocalDate getDateOfArrival() {
    return dateOfArrival;
}

public String getOutboundVoyageNumber() {
    return outboundVoyageNumber;
}

public String getOutboundVesselName() {
    return outboundVesselName;
}

public LocalDate getExpectedDepartureDate() {
    return expectedDepartureDate;
}

public String getManifestNumber() {
    return manifestNumber;
}

public String getBillOfLadingWaybill() {
    return billOfLadingWaybill;
}

public String getRotationCallReference() {
    return rotationCallReference;
}

public String getRemarksInstructions() {
    return remarksInstructions;
}

public RequestStatus getStatus() {
    return status;
}

public String getReviewComments() {
    return reviewComments;
}

public String getPdfCertificatePath() {
    return pdfCertificatePath;
}

public Instant getCreatedAt() {
    return createdAt;
}

public Instant getUpdatedAt() {
    return updatedAt;
}

public void setStatus(RequestStatus status){
    this.status=status;
}

public void setRequesterUserId(UserAccount requesterUserId) {
    this.requesterUserId = requesterUserId;
}

public void setShippingAgentName(String shippingAgentName) {
    this.shippingAgentName = shippingAgentName;
}

public void setAgentCodeJca(String agentCodeJca) {
    this.agentCodeJca = agentCodeJca;
}

public void setTrn(String trn) {
    this.trn = trn;
}

public void setApplicantName(String applicantName) {
    this.applicantName = applicantName;
}

public void setEmailAddress(String emailAddress) {
    this.emailAddress = emailAddress;
}

public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
}

public void setRequestType(String requestType) {
    this.requestType = requestType;
}

public void setPortTerminal(String portTerminal) {
    this.portTerminal = portTerminal;
}

public void setPurposeOfCertificate(String purposeOfCertificate) {
    this.purposeOfCertificate = purposeOfCertificate;
}

public void setInboundVoyageNo(String inboundVoyageNo) {
    this.inboundVoyageNo = inboundVoyageNo;
}

public void setInboundVesselName(String inboundVesselName) {
    this.inboundVesselName = inboundVesselName;
}

public void setDateOfArrival(LocalDate dateOfArrival) {
    this.dateOfArrival = dateOfArrival;
}

public void setOutboundVoyageNumber(String outboundVoyageNumber) {
    this.outboundVoyageNumber = outboundVoyageNumber;
}

public void setOutboundVesselName(String outboundVesselName) {
    this.outboundVesselName = outboundVesselName;
}

public void setExpectedDepartureDate(LocalDate expectedDepartureDate) {
    this.expectedDepartureDate = expectedDepartureDate;
}

public void setManifestNumber(String manifestNumber) {
    this.manifestNumber = manifestNumber;
}

public void setBillOfLadingWaybill(String billOfLadingWaybill) {
    this.billOfLadingWaybill = billOfLadingWaybill;
}

public void setRotationCallReference(String rotationCallReference) {
    this.rotationCallReference = rotationCallReference;
}

public void setRemarksInstructions(String remarksInstructions) {
    this.remarksInstructions = remarksInstructions;
}

public void setReviewComments(String reviewComments) {
    this.reviewComments = reviewComments;
}

public void setPdfCertificatePath(String pdfCertificatePath) {
    this.pdfCertificatePath = pdfCertificatePath;
}

}
