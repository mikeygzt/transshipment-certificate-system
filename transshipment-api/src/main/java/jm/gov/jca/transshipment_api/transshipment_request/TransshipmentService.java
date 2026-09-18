package jm.gov.jca.transshipment_api.transshipment_request;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import jm.gov.jca.transshipment_api.audit.AuditAction;
import jm.gov.jca.transshipment_api.audit.AuditLogService;
import jm.gov.jca.transshipment_api.review.ReviewQueueEventService;
import jm.gov.jca.transshipment_api.transshipment_certificate.CertificateService;
import jm.gov.jca.transshipment_api.transshipment_request.dto.ContainerDetailsRequest;
import jm.gov.jca.transshipment_api.transshipment_request.dto.ContainerDetailsResponse;
import jm.gov.jca.transshipment_api.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsRequest;
import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsResponse;
import jm.gov.jca.transshipment_api.user.UserAccount;

@Service
public class TransshipmentService {

    private final TransshipmentRequestRepository transshipmentRequestRepository;
    private final RequestMapper requestMapper;
    private final UserRepository userRepository;
    private final ContainerDetailsRepository containerDetailsRepository;
    private final ContainerMapper containerMapper;
    private final AuditLogService auditLogService;
    private final CertificateService certificateService;
    private final ReviewQueueEventService reviewQueueEventService;

    public TransshipmentService(
            TransshipmentRequestRepository transshipmentRequestRepository,
            RequestMapper requestMapper,
            UserRepository userRepository,
            ContainerDetailsRepository containerDetailsRepository,
            ContainerMapper containerMapper,
            AuditLogService auditLogService,
            CertificateService certificateService,
            ReviewQueueEventService reviewQueueEventService
        ) {
        this.transshipmentRequestRepository = transshipmentRequestRepository;
        this.requestMapper = requestMapper;
        this.userRepository = userRepository;
        this.containerDetailsRepository = containerDetailsRepository;
        this.containerMapper = containerMapper;
        this.auditLogService = auditLogService;
        this.certificateService = certificateService;
        this.reviewQueueEventService = reviewQueueEventService;
    }

    //create a response entity
    //TransshipmentDetailsResponse newrequest= createRequest(request);
    //refactoring note: old ver was  creating a copy, should be actually saving to the db. create it so that there is an entity being passed
    //return transshipmentRequestRepository.save(request);
    //refactoring note 2: adjust to also accept a list of container details (at least one needed), call saving function on the list, return the request
    //plus the container(s) attached to this request
    @Transactional
    public TransshipmentDetailsResponse createRequest(TransshipmentDetailsRequest request) {

        UserAccount requester = userRepository.findById(request.requesterUserId())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
                );

        TransshipmentRequest entity = new TransshipmentRequest(
                requester,
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
                request.reviewComments()
        );

        // Audit log capture
        RequestStatus previousStatus = entity.getStatus();

        entity.setStatus(RequestStatus.SUBMITTED);

        // Audit log capture
        RequestStatus newStatus = entity.getStatus();

        TransshipmentRequest savedRequest = transshipmentRequestRepository.saveAndFlush(entity);

        // temp
        System.out.println("CREATED AT AFTER SAVE: " + savedRequest.getCreatedAt());

        List<ContainerDetails> newContainers = request.containers().stream()
                .map(c -> new ContainerDetails(
                        savedRequest,
                        c.containerNumber(),
                        c.sealNumber(),
                        c.sizeType(),
                        c.cargoDescription(),
                        c.packages(),
                        c.grossWeightKg(),
                        c.yardLocation(),
                        c.origin(),
                        c.finalDestination()
                ))
                .toList();

        List<ContainerDetails> savedContainers = containerDetailsRepository.saveAll(newContainers);

        // Audit log
        auditLogService.recordTransshipmentRequestAction(
                savedRequest.getRequestId(),
                requester, 
                AuditAction.REQUEST_SUBMITTED, 
                previousStatus, 
                newStatus
        );

        return buildResponse(savedRequest, savedContainers);
    }

    private TransshipmentDetailsResponse buildResponse(TransshipmentRequest request) {
        List<ContainerDetails> containers = containerDetailsRepository.findByRequestRequestId(request.getRequestId());
        return buildResponse(request, containers);
    }

    private TransshipmentDetailsResponse buildResponse(TransshipmentRequest request, List<ContainerDetails> containers) {
        List<ContainerDetailsResponse> containerResponses = containers.stream()
                .map(containerMapper::toResponse)
                .toList();

        return requestMapper.toResponse(request, containerResponses);
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

        return buildResponse(request);
    }


    //to be added: get requests by user id
    @Transactional
    public List<TransshipmentDetailsResponse> getUserRequests(UUID id){
        //search db for all requests under this User
        //id is a user id
        return transshipmentRequestRepository.findByRequesterUserIdId(id)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    @Transactional
    public void updateRequest(UUID id, TransshipmentDetailsRequest request, Authentication authentication) {

        TransshipmentRequest thisRequest = transshipmentRequestRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found")
                );
        
        UserAccount performedBy = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                        "Authenticated user not found"));

        RequestStatus previousStatus = thisRequest.getStatus();
        
        // temp
        System.out.println("PREVIOUS STATUS: " + previousStatus);

        requestMapper.updateEntityFromRequest(request, thisRequest);
        //replace that information in db
        if (request.requesterUserId() != null) {
            UserAccount requester = userRepository.findById(request.requesterUserId())
                    .orElseThrow(() ->
                            new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
                    );
            thisRequest.setRequesterUserId(requester);
        }

        RequestStatus newStatus = thisRequest.getStatus();

        if (newStatus == RequestStatus.APPROVED || newStatus == RequestStatus.REJECTED) {
                if (previousStatus != RequestStatus.UNDER_REVIEW) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "This request is not currently under review."
                        );
                }

                if (
                        thisRequest.getAssignedReviewer() == null || 
                        !thisRequest.getAssignedReviewer().getId().equals(performedBy.getId())
                ) {
                        throw new ResponseStatusException(
                                HttpStatus.FORBIDDEN, 
                                "This request is assigned to another reviewer."
                        );
                }
        }

        // temp
        System.out.println("NEW STATUS: " + newStatus);

        if (newStatus == RequestStatus.APPROVED || newStatus == RequestStatus.REJECTED) {
                thisRequest.setAssignedReviewer(null);
                thisRequest.setAssignedReviewer(null);
        }

       TransshipmentRequest savedRequest = transshipmentRequestRepository.save(thisRequest);

        if (request.containers() != null) {
                updateContainers(thisRequest, request.containers());
        }

        // Audit log
        if (previousStatus != newStatus) {       
                AuditAction auditAction = null;
                
                if (newStatus == RequestStatus.APPROVED) {
                        certificateService.generateCertificate(savedRequest); // PDF certificate generation
                        auditAction = AuditAction.REQUEST_APPROVED;

                } else if (newStatus == RequestStatus.REJECTED) {
                        auditAction = AuditAction.REQUEST_REJECTED;

                } else if (previousStatus == RequestStatus.REJECTED && 
                        newStatus == RequestStatus.RESUBMITTED
                ) {
                        auditAction = AuditAction.REQUEST_RESUBMITTED;
                }

                
                if (auditAction != null) {         
                        auditLogService.recordTransshipmentRequestAction(
                                thisRequest.getRequestId(),
                                performedBy, 
                                auditAction, 
                                previousStatus, 
                                newStatus
                        );
                }

                reviewQueueEventService.notifyQueueChangedAfterCommit();
        }
    }

    private void updateContainers(TransshipmentRequest thisRequest, List<ContainerDetailsRequest> incoming) {

        Map<UUID, ContainerDetails> existingById = containerDetailsRepository
                .findByRequestRequestId(thisRequest.getRequestId())
                .stream()
                .collect(Collectors.toMap(ContainerDetails::getContainerId, c -> c));

        for (ContainerDetailsRequest containerRequest : incoming) {
            ContainerDetails matched = containerRequest.containerId() != null
                    ? existingById.remove(containerRequest.containerId())
                    : null;

            if (matched != null) {
                containerMapper.updateEntityFromRequest(containerRequest, matched);
                containerDetailsRepository.save(matched);
            } else {
                ContainerDetails newContainer = new ContainerDetails(
                        thisRequest,
                        containerRequest.containerNumber(),
                        containerRequest.sealNumber(),
                        containerRequest.sizeType(),
                        containerRequest.cargoDescription(),
                        containerRequest.packages(),
                        containerRequest.grossWeightKg(),
                        containerRequest.yardLocation(),
                        containerRequest.origin(),
                        containerRequest.finalDestination()
                );
                containerDetailsRepository.save(newContainer);
            }
        }

        containerDetailsRepository.deleteAll(existingById.values());
    }

    //Enable reviewers to view the list of general requests
    @Transactional
    //@PreAuthorize("hasRole('REVIEWER')")
    public List<TransshipmentDetailsResponse> getAllRequests(){
        //currently might not be using json, triple check this
        //update to match
        //return transshipmentRequestRepository.findAll();
        return transshipmentRequestRepository.findAll().stream().map(this::buildResponse).toList();

    }

    @Transactional
    public TransshipmentRequest claimRequest(UUID requestId, Authentication authentication) {
        UserAccount reviewer = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> 
                        new ResponseStatusException(HttpStatus.NOT_FOUND, 
                                "Reviewer account not found."
                        )
                );
        
        TransshipmentRequest request = transshipmentRequestRepository
                .findByRequestIdForUpdate(requestId)
                .orElseThrow(() -> 
                        new ResponseStatusException(HttpStatus.NOT_FOUND, 
                                "Request not found."
                        )
                );
        
        if (request.getStatus() != RequestStatus.SUBMITTED && 
                request.getStatus() != RequestStatus.RESUBMITTED
        ) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, 
                        "This request is no longer available for review."
                );
        }

        request.setStatus(RequestStatus.UNDER_REVIEW);
        request.setAssignedReviewer(reviewer);
        request.setReviewClaimedAt(Instant.now());

        TransshipmentRequest savedRequest = 
                transshipmentRequestRepository.save(request);
        
        reviewQueueEventService.notifyQueueChangedAfterCommit();
        

        return savedRequest;
    }

    @Transactional
    public TransshipmentRequest releaseRequest(UUID requestId, Authentication authentication) {
        UserAccount reviewer = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> 
                        new ResponseStatusException(HttpStatus.NOT_FOUND, 
                                "Reviewer account not found."
                        )
        );

        TransshipmentRequest request = transshipmentRequestRepository
                .findByRequestIdForUpdate(requestId)
                .orElseThrow(() -> 
                        new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Request not found."
                        )
        );

        if (request.getStatus() != RequestStatus.UNDER_REVIEW || 
                !request.getAssignedReviewer().getId().equals(reviewer.getId())
        ) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                        "This request is assigned to another reviewer."
                );
        }

        request.setStatus(RequestStatus.SUBMITTED);
        request.setAssignedReviewer(null);
        request.setReviewClaimedAt(null);

        TransshipmentRequest savedRequest = 
                transshipmentRequestRepository.save(request);

        reviewQueueEventService.notifyQueueChangedAfterCommit();

        return savedRequest;
    }

    @Transactional
    public void refreshRequestClaim(UUID requestId, Authentication authentication) {
        UserAccount reviewer = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> 
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                                "Authenticated reviewer not found."
                        )
                );
        
        TransshipmentRequest request = transshipmentRequestRepository
                .findByRequestIdForUpdate(requestId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, 
                                "Request not found"
                        )
                );
        
        if (request.getStatus() != RequestStatus.UNDER_REVIEW) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, 
                        "This request is no longer under review"
                );
        }

        if (request.getAssignedReviewer() == null || 
                !request.getAssignedReviewer().getId().equals(reviewer.getId())) {

                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                                "This request is assigned to another reviewer."
                        );
        }

        request.setReviewClaimedAt(Instant.now());
        transshipmentRequestRepository.save(request);
    }
}