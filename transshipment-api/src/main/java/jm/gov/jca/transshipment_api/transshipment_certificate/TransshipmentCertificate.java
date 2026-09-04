package jm.gov.jca.transshipment_api.transshipment_certificate;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import jm.gov.jca.transshipment_api.transshipment_request.TransshipmentRequest;

@Entity
@Table(name = "transshipment_certificate")
public class TransshipmentCertificate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "certificate_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private TransshipmentRequest request;

    @Column(name = "control_number", nullable = false, unique = true, length = 50)
    private String controlNumber;

    @Column(name = "file_key", nullable = false, length = 500)
    private String fileKey;

    @Column(name = "sha256_hash", nullable = false, length = 64)
    private String sha256Hash;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    private void onCreate() {
        generatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public TransshipmentRequest getRequest() {
        return request;
    }

    public String getControlNumber() {
        return controlNumber;
    }

    public String getFileKey() {
        return fileKey;
    }

    public String getSha256Hash() {
        return sha256Hash;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setRequest(TransshipmentRequest request) {
        this.request = request;
    }

    public void setControlNumber(String controlNumber) {
        this.controlNumber = controlNumber;
    }

    public void setFileKey(String fileKey) {
        this.fileKey = fileKey;
    }

    public void setSha256Key(String sha256Hash) {
        this.sha256Hash = sha256Hash;
    }
}
