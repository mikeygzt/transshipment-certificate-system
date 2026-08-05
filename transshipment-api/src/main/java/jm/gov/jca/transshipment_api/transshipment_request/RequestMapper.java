package jm.gov.jca.transshipment_api.transshipment_request;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsRequest;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE //Ignore the value of the nulled parameters
)
public interface RequestMapper{

    @Mapping(target = "status", ignore = true)
    @Mapping(target = "requesterUserId", ignore = true)
    void updateEntityFromRequest(TransshipmentDetailsRequest request, @MappingTarget TransshipmentRequest entity);


    
}
