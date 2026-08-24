import { UserRole } from "./auth.models";
import { RequestStatus } from "./transhipmentrequest.models";

export type AuditAction = 
"USER_LOGIN" |
"REQUEST_SUBMITTED" |
"REQUEST_APPROVED" |
"REQUEST_REJECTED" |
"REQUEST_RESUBMITTED" |
"USER_ROLE_MODIFIED"

export interface AuditLogResponse {
    id: string;
    transshipmentRequestId: string | null;
    performedByUserId: string;
    performedByEmail: string;
    targetUserId: string | null;
    targetUserEmail: string | null;
    action: AuditAction;
    previousRequestStatus: RequestStatus | null;
    newRequestStatus: RequestStatus | null;
    previousRole: UserRole | null;
    newRole: UserRole | null;
    timestamp: string;

}