package jm.gov.jca.transshipment_api.transshipment_certificate;


import java.util.UUID;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {
    
    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping("/request/{requestId}/pdf")
    public ResponseEntity<byte[]> getCertificatePdf(
        @PathVariable UUID requestId
    ) {
        TransshipmentCertificate certificate = certificateService.getCertfificateByRequestId(requestId);

        byte[] pdf = certificateService.getCertificatePdfByRequestId(requestId);

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_PDF);

        headers.setContentDisposition(
            ContentDisposition.inline()
                .filename(certificate.getControlNumber() + ".pdf")
                .build()
        );
        
        return ResponseEntity
                .ok()
                .headers(headers)
                .body(pdf);
    
    }

    @GetMapping("/verify/{controlNumber}")
    public CertificateVerificationResponse verifyController(
        @PathVariable String controlNumber
    ) {
        return certificateService.verifyCertificate(controlNumber);
    }

    @GetMapping("/verify/{controlNumber}/pdf")
    public ResponseEntity<byte[]> viewVerifiedCertificate(
        @PathVariable String controlNumber
    ) {
        TransshipmentCertificate certificate = 
            certificateService.getCertificateByControlNumber(controlNumber);

        byte[] pdf = certificateService
            .getCertificatePdfByControlNumber(controlNumber);
        
        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_PDF);

        headers.setContentDisposition(
            ContentDisposition.inline()
                .filename(
                    certificate.getControlNumber()
                )
                .build()
        );

        return ResponseEntity
            .ok()
            .headers(headers)
            .body(pdf);
    }
}
