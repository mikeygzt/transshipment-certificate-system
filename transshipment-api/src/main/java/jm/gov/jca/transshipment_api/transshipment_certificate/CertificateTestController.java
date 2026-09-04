package jm.gov.jca.transshipment_api.transshipment_certificate;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/certificates/test")
public class CertificateTestController {
    private final CertificatePdfService certificatePdfService;

    public CertificateTestController(CertificatePdfService certificatePdfService) {
        this.certificatePdfService = certificatePdfService;
    }

    @GetMapping()
    public ResponseEntity<byte[]> generateTestCertificate() {
        byte[] pdf = certificatePdfService.generateTestCertificate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
            ContentDisposition.inline()
                .filename("test-certificate.pdf")
                .build()
        );

        return ResponseEntity
            .ok()
            .headers(headers)
            .body(pdf);
    }
}
