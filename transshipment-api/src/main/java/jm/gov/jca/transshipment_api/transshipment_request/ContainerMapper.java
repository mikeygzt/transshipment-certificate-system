package jm.gov.jca.transshipment_api.transshipment_request;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import jm.gov.jca.transshipment_api.transshipment_request.dto.ContainerDetailsRequest;
import jm.gov.jca.transshipment_api.transshipment_request.dto.ContainerDetailsResponse;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ContainerMapper {

    @Mapping(target = "requestId", ignore = true)
    void updateEntityFromRequest(ContainerDetailsRequest request, @MappingTarget ContainerDetails entity);

    @Mapping(target = "requestId", source = "requestId.requestId")
    ContainerDetailsResponse toResponse(ContainerDetails details);

}