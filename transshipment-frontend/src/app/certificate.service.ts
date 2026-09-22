import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CertificateVerificationResponse } from "./certificate-verification/certificate-verification";

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

    verifyCertificate(controlNumber: string) {
        return this.http.get<CertificateVerificationResponse>(
            `/api/certificates/verify/${encodeURIComponent(controlNumber)}`
        )
    }

    getVerifiedCertificatePdf(controlNumber: string) {
        return this.http.get(
            `/api/certificates/verify/${encodeURIComponent(controlNumber)}/pdf`,
            {
                responseType: "blob"
            }
        )
    }
}