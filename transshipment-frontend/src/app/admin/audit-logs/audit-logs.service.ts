import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { readonly } from "@angular/forms/signals"
import { Observable } from "rxjs";
import { AuditLogResponse } from "../../audit-log.model";

@Injectable({
    providedIn: "root"
})
export class AuditLogService {
    private readonly http = inject(HttpClient);

    getAllAuditLogs(): Observable<AuditLogResponse[]> {
        return this.http.get<AuditLogResponse[]>(
            `/api/admin/audit-logs`
        );
    }
}