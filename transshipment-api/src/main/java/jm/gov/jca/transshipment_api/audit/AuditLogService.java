package jm.gov.jca.transshipment_api.audit;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jm.gov.jca.transshipment_api.transshipment_request.RequestStatus;
import jm.gov.jca.transshipment_api.user.Role;
import jm.gov.jca.transshipment_api.user.UserAccount;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(
        AuditLogRepository auditLogRepository
    ) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void recordLogin(UserAccount user) {
        AuditLog auditLog = new AuditLog();

        auditLog.setPerformedByUserId(user.getId());
        auditLog.setPerformedByEmail(user.getEmail());
        auditLog.setAction(AuditAction.USER_LOGIN);

        auditLogRepository.save(auditLog);
    }

    @Transactional
    public void recordTransshipmentRequestAction(
        UUID transshipmentRequestId,
        UserAccount performedBy,
        AuditAction action,
        RequestStatus previousStatus,
        RequestStatus newRequestStatus
    ) {
        AuditLog auditLog = new AuditLog();

        auditLog.setTransshipmentRequestId(transshipmentRequestId);
        auditLog.setPerformedByUserId(performedBy.getId());
        auditLog.setPerformedByEmail(performedBy.getEmail());
        auditLog.setAction(action);
        auditLog.setPreviousStatus(previousStatus);
        auditLog.setNewRequestStatus(newRequestStatus);
        
        auditLogRepository.save(auditLog);
    }

    @Transactional
    public void recordRoleModification(
        UserAccount performedBy,
        UserAccount targetUser,
        Role previousRole,
        Role newRole
    ){
        AuditLog auditLog = new AuditLog();
        
        auditLog.setPerformedByUserId(performedBy.getId());
        auditLog.setPerformedByEmail(performedBy.getEmail());
        auditLog.setTargetUserId(targetUser.getId());
        auditLog.setTargetEmail(targetUser.getEmail());
        auditLog.setAction(AuditAction.USER_ROLE_MODIFIED);
        auditLog.setPreviousRole(previousRole);
        auditLog.setNewRole(newRole);

        auditLogRepository.save(auditLog);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogRepository
            .findAllByOrderByTimestampDesc()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    private AuditLogResponse toResponse(AuditLog auditLog) {
        return new AuditLogResponse(
            auditLog.getId(),
            auditLog.getTransshipmentRequestId(),
            auditLog.getPerformedByUserId(),
            auditLog.getPerformedByEmail(),
            auditLog.getTargetUserId(),
            auditLog.getTargetUserEmail(),
            auditLog.getAction(),
            auditLog.getPreviousRequestStatus(),
            auditLog.getNewRequestStatus(),
            auditLog.getPreviousRole(),
            auditLog.getNewRole(),
            auditLog.getTimestamp()
        );
    }
}
