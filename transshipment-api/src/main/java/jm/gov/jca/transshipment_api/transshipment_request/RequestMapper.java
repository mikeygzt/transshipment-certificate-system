package jm.gov.jca.transshipment_api.transshipment_request;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import jm.gov.jca.transshipment_api.transshipment_request.dto.ContainerDetailsResponse;
import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsRequest;
import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsResponse;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE //Ignore the value of the nulled parameters
)
public interface RequestMapper{

    //removed the ignore for the status
    @Mapping(target = "requesterUserId", ignore = true)
    void updateEntityFromRequest(TransshipmentDetailsRequest request, @MappingTarget TransshipmentRequest entity);

    @Mapping(target = "requesterUserId", source = "request.requesterUserId.id")
    @Mapping(target = "containers", source = "containers")
    TransshipmentDetailsResponse toResponse(TransshipmentRequest request, List<ContainerDetailsResponse> containers);

}