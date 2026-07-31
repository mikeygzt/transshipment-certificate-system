package jm.gov.jca.transshipment_api.transshipment_request;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsRequest;
import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsResponse;
import jm.gov.jca.transshipment_api.user.UserAccount;

@Service
public class TransshipmentService {

    private final TransshipmentRequestRepository transshipmentRequestRepository;

    public TransshipmentService(TransshipmentRequestRepository transshipmentRequestRepository){
        this.transshipmentRequestRepository = transshipmentRequestRepository;

    }

    //Create New Request
    @Transactional
    public TransshipmentDetailsResponse createRequest(TransshipmentDetailsRequest request){
        //create a response entity
        TransshipmentDetailsResponse newrequest= createRequest(request);

        //

        //refactoring note: old ver was  creating a copy, should be actually saving to the db. create it so that there is an entity being passed

        return transshipmentRequestRepository.save(newrequest);

    }

    //to be added: get request-> Get Singular request from the db by id

    //to be added: get requests by user id

    //Allow for updates to the request
    @Transactional
    public void updateRequest(Long requestId){
        TransshipmentRequest request = transshipmentRequestRepository
        .findByRequesterId(requestId)
        .orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found")
        );

        //Find the request by id
        //identify the information needed to be changed
        //replace that information in db
        //transshipmentRequestRepository.update(request);

    }

    //Enable reviewers to view the list of general requests
    @Transactional
    @PreAuthorize("hasRole('REVIEWER')")
    public List<TransshipmentDetailsResponse> getAllRequests(){
        return transshipmentRequestRepository.findAll().stream().map(this::newRequest).toList();
    }

    //Delete method
   @Transactional
   public void deleteRequest(Long requestId){
    TransshipmentRequest request = transshipmentRequestRepository
        .findByRequesterId(requestId)
        .orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found")
        );

        transshipmentRequestRepository.delete(request);

   }


   private TransshipmentDetailsResponse createRequest(
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
   ){

    TransshipmentRequest request = new TransshipmentRequest(
        requesterUserId,
        shippingAgentName,
        agentCodeJca,
        trn,
        applicantName,
        emailAddress,
        phoneNumber,
        requestType,
        portTerminal, 
        purposeOfCertificate, 
        inboundVoyageNo, 
        inboundVesselName, 
        dateOfArrival, 
        outboundVoyageNumber, 
        outboundVesselName, 
        expectedDepartureDate, 
        manifestNumber, 
        billOfLadingWaybill, 
        rotationCallReference, 
        remarksInstructions, 
        status, 
        reviewComments, 
        pdfCertificatePath);

        TransshipmentRequest saved = transshipmentRequestRepository.save(request);

        return newRequest(saved);

}


public TransshipmentDetailsResponse newRequest(TransshipmentRequest request) {
    return new TransshipmentDetailsResponse(
        request.getRequesterUserId(),
        request.getShippingAgentName(),
        request.getAgentCodeJca(),
        request.getTrn(),
        request.getApplicantName(),
        request.getEmailAddress(),
        request.getPhoneNumber(),
        request.getRequestType(),
        request.getPortTerminal(),
        request.getPurposeOfCertificate(),
        request.getInboundVoyageNo(),
        request.getInboundVesselName(),
        request.getDateOfArrival(),
        request.getOutboundVoyageNumber(),
        request.getOutboundVesselName(),
        request.getExpectedDepartureDate(),
        request.getManifestNumber(),
        request.getBillOfLadingWaybill(),
        request.getRotationCallReference(),
        request.getRemarksInstructions(),
        request.getStatus(),
        request.getReviewComments(),
        request.getPdfCertificatePath()
    );
}



    
}
