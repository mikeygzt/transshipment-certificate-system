import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class CertificateService {
    private readonly http = inject(HttpClient);
    
    generateCertificatePdf(requestId: string) {
        return this.http.get(
            `/api/certificates/request/${requestId}/pdf`,
            {
                responseType: "blob"
            }
        );
    }
}