package jm.gov.jca.transshipment_api.transshipment_certificate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jm.gov.jca.transshipment_api.transshipment_request.ContainerDetails;
import jm.gov.jca.transshipment_api.transshipment_request.ContainerDetailsRepository;
import jm.gov.jca.transshipment_api.transshipment_request.RequestStatus;
import jm.gov.jca.transshipment_api.transshipment_request.TransshipmentRequest;

@Service
public class CertificateService {
    private final TransshipmentCertificateRepository certificateRepository;
    private final ContainerDetailsRepository containerDetailsRepository;
    private final CertificateControlNumberService controlNumberService;
    private final QRCodeService qrCodeService;
    private final CertificatePdfService certificatePdfService;
    private final CertificateHashService certificateHashService;
    private final CertificateStorageService certificateStorageService;

    private final String verificationBaseUrl;

    public CertificateService(
        TransshipmentCertificateRepository certificateRepository,
        ContainerDetailsRepository containerDetailsRepository,
        CertificateControlNumberService controlNumberService,
        QRCodeService qrCodeService,
        CertificatePdfService certificatePdfService,
        CertificateHashService certificateHashService,
        CertificateStorageService certificateStorageService,
        @Value(
            "${certificate.verification.base-url://http://localhost:4200/verify-certificate}"
        )
        String verificationBaseUrl
    ) {
        this.certificateRepository = certificateRepository;
        this.containerDetailsRepository = containerDetailsRepository;
        this.controlNumberService = controlNumberService;
        this.qrCodeService = qrCodeService;
        this.certificatePdfService = certificatePdfService;
        this.certificateHashService = certificateHashService;
        this.certificateStorageService = certificateStorageService;
        this.verificationBaseUrl = verificationBaseUrl;
    }

    @Transactional
    public TransshipmentCertificate generateCertificate(TransshipmentRequest request) {
        if (request.getStatus() != RequestStatus.APPROVED) {
            throw new IllegalStateException(
                "A certificate can only be generated for an approved request."
            );
        }
        
        if (certificateRepository.existsByRequestRequestId(request.getRequestId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "A certificate has already been generated for this request."
            );
        }

        String controlNumber = controlNumberService.generateControlNumber();

        List<ContainerDetails> containers = containerDetailsRepository
            .findByRequestRequestId(request.getRequestId());

        CertificateData certificateData = buildCertificateData(request, containers, controlNumber);

        String verificationUrl = verificationBaseUrl + "/" + controlNumber;

        byte[] qrCodePng = qrCodeService.generateQRCode(verificationUrl, 250, 250);

        byte[] pdfBytes = certificatePdfService.generateCertificate(certificateData, qrCodePng);

        String sha256Hash = certificateHashService.calculateSha256(pdfBytes);

        String fileKey = 
        """
          certificates/%d/%s.pdf      
        """
        .formatted(
            LocalDate.now().getYear(),
            controlNumber
        )
        .trim();

        String storedFileKey = certificateStorageService.store(fileKey, pdfBytes);

        TransshipmentCertificate certificate = new TransshipmentCertificate();

        certificate.setRequest(request);
        certificate.setControlNumber(controlNumber);
        certificate.setFileKey(storedFileKey);
        certificate.setSha256Key(sha256Hash);

        return certificateRepository.save(certificate);
    }

    @Transactional(readOnly = true)
    public byte[] getCertificatePdfByRequestId(UUID requestId) {
        TransshipmentCertificate certificate = certificateRepository
            .findByRequestRequestId(requestId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Certificate not found for this request."));

        return certificateStorageService.load(certificate.getFileKey());
    }

    @Transactional(readOnly = true)
    public TransshipmentCertificate getCertfificateByRequestId(UUID requestId) {
        return certificateRepository
            .findByRequestRequestId(requestId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Certificate not found for this request."));
    }

    private CertificateData buildCertificateData(
        TransshipmentRequest request,
        List<ContainerDetails> containers,
        String controlNumber
    ) {
        List<CertificateContainerData> containerData =
            containers.stream()
                .map(container ->
                    new CertificateContainerData(
                        container.getContainerNumber(), 
                        container.getSealNumber(), 
                        container.getSizeType(), 
                        container.getCargoDescription(), 
                        container.getPackages(), 
                        formatWeight(
                            container.getGrossWeightKg()
                        )
                    )
                )
                .toList();
        
        return new CertificateData(
            controlNumber,
            LocalDate.now(),

            request.getApplicantName(),
            request.getShippingAgentName(),
            request.getAgentCodeJca(),
            request.getTrn(),

            request.getPortTerminal(),
            request.getPurposeOfCertificate(),
            
            request.getInboundVesselName(),
            request.getInboundVoyageNo(),
            request.getDateOfArrival(),

            request.getOutboundVesselName(),
            request.getOutboundVoyageNumber(),
            request.getExpectedDepartureDate(),

            request.getManifestNumber(),
            request.getBillOfLadingWaybill(),
            
            request.getRotationCallReference(),

            "Verified - Remained under Customs control",

            containerData,

            request.getReviewComments()
        );
    }

    private String formatWeight(BigDecimal weight) {
        if (weight == null) {
            return "-";
        }

        return weight.stripTrailingZeros().toPlainString() + "kg";
    }
}
