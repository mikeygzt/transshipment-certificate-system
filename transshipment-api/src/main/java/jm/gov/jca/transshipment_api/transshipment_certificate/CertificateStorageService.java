package jm.gov.jca.transshipment_api.transshipment_certificate;

public interface CertificateStorageService {
    String store(
        String fileKey,
        byte[] pdfBytes
    );

    byte[] load(String fileKey);
}
