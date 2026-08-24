package jm.gov.jca.transshipment_api.audit;

import java.time.LocalDateTime;
import java.util.UUID;

import jm.gov.jca.transshipment_api.transshipment_request.RequestStatus;
import jm.gov.jca.transshipment_api.user.Role;

public record AuditLogResponse(
    UUID id,
    UUID transshipmentRequestId,
    UUID performedByUserId,
    String performedByEmail,
    UUID targetUserId,
    String targetUserEmail,
    AuditAction action,
    RequestStatus previousRequestStatus,
    RequestStatus newRequestStatus,
    Role previousRole,
    Role newRole,
    LocalDateTime timestamp
) {
}
