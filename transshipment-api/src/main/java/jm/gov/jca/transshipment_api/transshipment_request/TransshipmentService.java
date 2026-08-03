package jm.gov.jca.transshipment_api.transshipment_request;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsRequest;
import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsResponse;
import jm.gov.jca.transshipment_api.user.UserAccount;
import jm.gov.jca.transshipment_api.user.dto.UserResponse;

@Service
public class TransshipmentService {

    private final TransshipmentRequestRepository transshipmentRequestRepository;
    private final RequestMapper requestMapper;

    public TransshipmentService(TransshipmentRequestRepository transshipmentRequestRepository, RequestMapper requestMapper){
        this.transshipmentRequestRepository = transshipmentRequestRepository;
        this.requestMapper = requestMapper;

    }

    //Create New Request
@Transactional
public TransshipmentDetailsResponse createRequest(TransshipmentDetailsRequest request) {
    //create a response entity
    //TransshipmentDetailsResponse newrequest= createRequest(request);
    //refactoring note: old ver was  creating a copy, should be actually saving to the db. create it so that there is an entity being passed
    //return transshipmentRequestRepository.save(request);
    TransshipmentRequest entity = new TransshipmentRequest(
        request.requesterUserId(),
        request.shippingAgentName(),
        request.agentCodeJca(),
        request.trn(),
        request.applicantName(),
        request.emailAddress(),
        request.phoneNumber(),
        request.requestType(),
        request.portTerminal(),
        request.purposeOfCertificate(),
        request.inboundVoyageNo(),
        request.inboundVesselName(),
        request.dateOfArrival(),
        request.outboundVoyageNumber(),
        request.outboundVesselName(),
        request.expectedDepartureDate(),
        request.manifestNumber(),
        request.billOfLadingWaybill(),
        request.rotationCallReference(),
        request.remarksInstructions(),
        request.reviewComments(),
        request.pdfCertificatePath()
    );

    entity.setStatus(RequestStatus.SUBMITTED);

    TransshipmentRequest savedRequest = transshipmentRequestRepository.save(entity);

    return toResponse(savedRequest);

}

    private TransshipmentDetailsResponse toResponse(TransshipmentRequest request){
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

    //to be added: get request-> Get Singular request from the db by id
    @Transactional
    public TransshipmentDetailsResponse getRequest(UUID id){
        //search db for particular request under this id
        //id is a request id
        TransshipmentRequest request = transshipmentRequestRepository
            .findById(id)
            .orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found")
            );

        return toResponse(request);
    }


    //to be added: get requests by user id
    @Transactional
    public List<TransshipmentDetailsResponse> getUserRequests(UUID id){
        //search db for all requests under this User
        //id is a user id
        return transshipmentRequestRepository.findByRequesterUserIdId(id)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    //Allow for updates to the request
    @Transactional
    public void updateRequest(@Valid @RequestBody TransshipmentDetailsRequest request) {
        //strip the value of the requestid
        UUID requestId = request.requestId();
        //Find the request by id

        TransshipmentRequest thisRequest = transshipmentRequestRepository
            .findById(requestId)
            .orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found")
            );
        //identify the information needed to be changed

        requestMapper.updateEntityFromRequest(request, thisRequest);
        //replace that information in db

        transshipmentRequestRepository.save(thisRequest);
}

    //Enable reviewers to view the list of general requests
    @Transactional
    @PreAuthorize("hasRole('REVIEWER')")
    public List<TransshipmentDetailsResponse> getAllRequests(){
        //currently might not be using json, triple check this
        //update to match
        //return transshipmentRequestRepository.findAll();
        return transshipmentRequestRepository.findAll().stream().map(this::toResponse).toList();

    }

    //Delete method
   @Transactional
   public void deleteRequest(UUID requestId){
    TransshipmentRequest request = transshipmentRequestRepository
        .findById(requestId)
        .orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found")
        );

        transshipmentRequestRepository.delete(request);

   }


    
}
