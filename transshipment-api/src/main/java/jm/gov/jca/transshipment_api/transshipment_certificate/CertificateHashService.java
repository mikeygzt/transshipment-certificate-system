package jm.gov.jca.transshipment_api.transshipment_certificate;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

import org.springframework.stereotype.Service;

@Service
public class CertificateHashService {
    public String calculateSha256(byte[] pdfBytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(pdfBytes);

            return HexFormat.of().formatHex(hash);
            
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                "SHA-256 algorithm is not available.",
                e
            );
        }
    }
}
