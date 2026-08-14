package jm.gov.jca.transshipment_api.transshipment_request;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import jm.gov.jca.transshipment_api.transshipment_request.dto.ContainerDetailsRequest;
import jm.gov.jca.transshipment_api.transshipment_request.dto.ContainerDetailsResponse;
import jm.gov.jca.transshipment_api.user.UserRepository;
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
    private final RequestMapper requestMapper;
    private final UserRepository userRepository;
    private final ContainerDetailsRepository containerDetailsRepository;
    private final ContainerMapper containerMapper;

    public TransshipmentService(
            TransshipmentRequestRepository transshipmentRequestRepository,
            RequestMapper requestMapper,
            UserRepository userRepository,
            ContainerDetailsRepository containerDetailsRepository,
            ContainerMapper containerMapper) {
        this.transshipmentRequestRepository = transshipmentRequestRepository;
        this.requestMapper = requestMapper;
        this.userRepository = userRepository;
        this.containerDetailsRepository = containerDetailsRepository;
        this.containerMapper = containerMapper;
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
                request.reviewComments(),
                request.pdfCertificatePath()
        );

        entity.setStatus(RequestStatus.SUBMITTED);

        TransshipmentRequest savedRequest = transshipmentRequestRepository.save(entity);

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

    //Allow for updates to the request
    @Transactional
    public void updateRequest(UUID id, TransshipmentDetailsRequest request) {
        //strip the value of the requestid
        //Find the request by id

        TransshipmentRequest thisRequest = transshipmentRequestRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found")
                );
        //identify the information needed to be changed

        requestMapper.updateEntityFromRequest(request, thisRequest);
        //replace that information in db
        if (request.requesterUserId() != null) {
            UserAccount requester = userRepository.findById(request.requesterUserId())
                    .orElseThrow(() ->
                            new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
                    );
            thisRequest.setRequesterUserId(requester);
        }

        transshipmentRequestRepository.save(thisRequest);

        if (request.containers() != null) {
            updateContainers(thisRequest, request.containers());
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

    //Delete method
    @Transactional
    public void deleteRequest(UUID requestId){
        TransshipmentRequest request = transshipmentRequestRepository
                .findById(requestId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found")
                );

        List<ContainerDetails> containers = containerDetailsRepository.findByRequestRequestId(requestId);
        containerDetailsRepository.deleteAll(containers);

        transshipmentRequestRepository.delete(request);

    }



}