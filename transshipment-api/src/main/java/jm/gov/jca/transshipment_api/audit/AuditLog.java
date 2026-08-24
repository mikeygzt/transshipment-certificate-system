package jm.gov.jca.transshipment_api.audit;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jm.gov.jca.transshipment_api.transshipment_request.RequestStatus;
import jm.gov.jca.transshipment_api.user.Role;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id")
    private UUID id;

    @Column(name = "transshipment_request_id")
    private UUID transshipmentRequestId;

    @Column(name = "performed_by_user_id", nullable = false)
    private UUID performedByUserId;

    @Column(name = "performed_by_email", nullable = false)
    private String performedByEmail;

    @Column(name = "target_user_id")
    private UUID targetUserId;

    @Column(name = "target_user_email")
    private String targetUserEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_request_status")
    private RequestStatus previousRequestStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_request_status")
    private RequestStatus newRequestStatus;

    @Column(name = "previous_role")
    private Role previousRole;

    @Column(name = "new_role")
    private Role newRole;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void beforeInsert() {
        this.timestamp = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getTransshipmentRequestId() {
        return transshipmentRequestId;
    }

    public UUID getPerformedByUserId() {
        return performedByUserId;
    }

    public UUID getTargetUserId() {
        return targetUserId;
    }

    public String getTargetUserEmail() {
        return targetUserEmail;
    }

    public String getPerformedByEmail() {
        return performedByEmail;
    }

    public AuditAction getAction() {
        return action;
    }

    public RequestStatus getPreviousRequestStatus() {
        return previousRequestStatus;
    }

    public RequestStatus getNewRequestStatus() {
        return newRequestStatus;
    }

    public Role getPreviousRole() {
        return previousRole;
    }

    public Role getNewRole() {
        return newRole;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTransshipmentRequestId(UUID transshipmentRequestId) {
        this.transshipmentRequestId = transshipmentRequestId;
    }

    public void setPerformedByUserId(UUID performedByUserId) {
        this.performedByUserId = performedByUserId;
    }

    public void setPerformedByEmail(String performedByEmail) {
        this.performedByEmail = performedByEmail;
    }

    public void setTargetUserId(UUID targetUserId) {
        this.targetUserId = targetUserId;
    }

    public void setTargetEmail(String targetUserEmail) {
        this.targetUserEmail = targetUserEmail;
    }

    public void setAction(AuditAction action) {
        this.action = action;
    }

    public void setPreviousStatus(RequestStatus previousRequestStatus) {
        this.previousRequestStatus = previousRequestStatus;
    }

    public void setNewRequestStatus(RequestStatus newRequestStatus) {
        this.newRequestStatus = newRequestStatus;
    }

    public void setPreviousRole(Role previousRole) {
        this.previousRole = previousRole;
    }

    public void setNewRole(Role newRole) {
        this.newRole = newRole;
    }
}
