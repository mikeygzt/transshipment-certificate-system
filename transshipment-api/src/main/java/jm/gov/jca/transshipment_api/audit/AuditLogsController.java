package jm.gov.jca.transshipment_api.audit;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AuditLogsController {
    private final AuditLogService auditLogService;

    public AuditLogsController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogService.getAllAuditLogs();
    }


}
