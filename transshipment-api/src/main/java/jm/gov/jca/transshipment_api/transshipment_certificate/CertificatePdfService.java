package jm.gov.jca.transshipment_api.transshipment_certificate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

import org.springframework.stereotype.Service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

@Service
public class CertificatePdfService {
    
    public byte[] generatePdf(String html) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();

            builder.withHtmlContent(html, null);
            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException(
                "Could not generate transshipment certificate PDF.",
                e
            );
        }
    }

    public byte[] generateCertificate(CertificateData data, byte[] qrCodePng) {
        String html = buildCertificateHtml(data, qrCodePng);

        return generatePdf(html);
    }

    public String buildCertificateHtml(CertificateData data, byte[] qrCodePng) {
        String qrCodeBase64 = Base64.getEncoder().encodeToString(qrCodePng);

        String issueDate = data.issueDate()
            .format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        
        StringBuilder containerRows = new StringBuilder();

        int number = 1;

        for (CertificateContainerData container : data.containers()) {
            
            containerRows.append(
                """
                <tr>
                    <td>%d</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                </tr>  
                """.formatted(
                number++,
                value(container.containerNumber()),
                value(container.sealNumber()),
                value(container.sizeType()),
                value(container.cargoDescription()),
                container.packages() == null ? "-" : container.packages(),
                value(container.grossWeight())
                )
            );
        }

        if (containerRows.isEmpty()){
            containerRows.append(
                """
                <tr>
                    <td colspan="7">No containers added.</td>
                </tr>            
                """
            );
        }

        return 
        """
        <html>
        <head>
            <style>
            @page {
                size: A4;
                margin: 25mm 18mm 20mm 18mm;
            }

            body {
                font-family: sans-serif;
                font-size: 10px;
                color: #1f2937;
            }

            .header-table {
                width: 100%%;
                border-bottom: 3px solid #17365d;
                padding-bottom: 12px;
                margin-bottom: 28px;
            }

            .header-table td {
                vertical-align: middle;
            }

            .agency-title {
                text-align: center;
            }

            .agent-title h1 {
                margin: 0;
                font-size: 20px;
            }

            .agency-title p {
                margin: 5px 0 0;
                font-size: 10px;
            }

            .certificate-info {
                text-align: right;
                font-size: 9px;
            }

            .certificate-title {
                text-align: center;
                font-size: 9px;
            }

            .intro {
                font-size: 10px;
                line-height: 1.6;
                margin-bottom: 18px;
            }

            table.details {
                width: 100%%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }

            .details td {
                border: 1px solid #aab2bd;
                padding: 8px;
                vertical-align: top;
            }

            .label {
                width: 20%%;
                font-weight: bold;
                background: #dce4ec;
            }

            .value {
                width: 30%%;
            }

            .section-title {
                font-size: 12px;
                font-weight: bold;
                margin: 14px 0 8px;
            }

            table.containers {
                width: 100%%;
                border-collapse: collapse;
                margin-bottom: 18px;
            }

            .details td,
            .containers th,
            .containers td {
                border: 1px solid #aab2bd;
                padding: 6px;
                font-size: 8px;
            }

            .containers th {
                background: #dce4ec;
                text-align: left;
            }

            .certification {
                line-height: 1.6;
                margin-top: 18px;
            }

            .notes {
                margin-top: 20px;
            }

            .verification-table {
                width: 100%%;
                margin-top: 25px;
            }

            .verification-table td {
                vertical-align: bottom;
            }

            .qr-area {
                text-align: right;
            }

            .qr-code {
                width: 90px;
                height: 90px;
            }

            .verification-code {
                font-size: 8px;
                text-align: center;
                margin-top: 4px;
            }

            .footer {
                margin-top: 18px;
                border-top: 1px solid #9ca3af;
                padding-top: 8px;
                text-align: center;
                font-size: 7px;
            }
            </style>
        </head>

        <body>
            <table class="header-table">
            <tr>
                <td style="width: 20%%;">JCA Seal</td>

                <td class="agency-title" style="width: 55%%;">
                <h1>Jamaica Customs Agency</h1>
                <p>Transshipment Certificate - Containers Remaining Under Customs Control</p>
                </td>

                <td class="certificate-info" style="width: 25%%;">
                <strong>Certificate No.</strong><br/>
                %s
                <br/><br/>

                <strong>Issue Date</strong><br/>
                %s
                </td>
            </tr>
            </table>

            <h2 class="certificate-title">
            CERTIFICATE OF TRANSSHIPMENT / CUSTOMS CONTROL
            </h2>

            <p class="intro">
            This is to certify, based on the records presented and 
            verified by the Jamaica Customs Agency, that the containerized
            cargo identified below was recorded as having remained within
            the approved port/customs area and under Customs control during
            the relevant transshipment period, subject to the particulars
            and limitations stated herein.
            </p>

            <table class="details">
            <tr>
                <td class="label">APPLICANT / SHIPPING AGENT</td>
                <td class="value">%s</td>

                <td class="label">AGENT CODE</td>
                <td class="value">%s</td>
            </tr>

            <tr>
                <td class="label">TRN / TIN</td>
                <td class="value">%s</td>

                <td class="label">APPLICANT</td>
                <td class="value">%s</td>
            </tr>
            
            <tr>
                <td class="label">PORT / TERMINAL</td>
                <td class="value">%s</td>

                <td class="label">PURPOSE</td>
                <td class="value">%s</td>
            </tr>

            <tr>
                <td class="label">INBOUND VESSEL / VOYAGE</td>
                <td class="value">%s / %s</td>

                <td class="label">DATE OF ARRIVAL</td>
                <td class="value">%s</td>
            </tr>
            
            <tr>
                <td class="label">OUTBOUND VESSEL / VOYAGE</td>
                <td class="value">%s / %s</td>

                <td class="label">DEPARTURE DATE</td>
                <td class="value">%s</td>
            </tr>

            <tr>
                <td class="label">MANIFEST NO.</td>
                <td class="value">%s</td>

                <td class="label">BILL OF LADING / WAYBILL</td>
                <td class="value">%s</td>
            </tr>

            <tr>
                <td class="label">CONTROL CHECK REF.</td>
                <td class="value">%s</td>

                <td class="label">VERIFICATION STATUS</td>
                <td class="value">%s</td>
            </tr>
            </table>

            <div class="section-title">
            Containerized Cargo Covered by this Certificate
            </div>

            <table class="containers">
            <thead>
                <tr>
                <th>#</th>
                <th>CONTAINER NO.</th>
                <th>SEAL</th>
                <th>SIZE/TYPE</th>
                <th>CARGO</th>
                <th>PACKAGES</th>
                <th>GROSS WEIGHT</th>
                </tr>
            </thead>

            <tbody>
                %s
            </tbody>
            </table>

            <p class="certification">
            <strong>Certification Satement:</strong>
            The Jamaica Customs Agency confirms that the above particulars
            have been reviewed against available Customs, manifest, terminal,
            and/or port control records. This certificate does not replace
            any statutory Customs declaration permit, licence, certificate of
            origin, or other document required under law. Any false declaration,
            altered document, or post-issuance discrepancy may result in
            cancellation of this certificate and further enforcement action.
            </p>

            <div class="notes">
            <strong>Officer Notes:</strong>
            %s
            </div>

            <table class="verification-table">
            <tr>
                <td></td>

                <td class="qr-area" style="width: 110px;">
                <img 
                    class="qr-code"
                    src="data:image/png;base64,%s"
                />

                <div class="verification-code">
                    QR / Verification Code<br/>
                    %s
                </div>
                </td>
            </tr>
            </table>

            <div class="footer">
            Generated through the JCA Transshipment Certificate Service Portal
            prototype. Certificate validity should be confirmed through the
            Agency's official verification channel.
            </div>

        </body>
        </html>

        """.formatted(
                    data.controlNumber(),
                    issueDate,

                    value(data.shippingAgentName()),
                    value(data.agentCode()),

                    value(data.trnTin()),
                    value(data.applicantName()),

                    value(data.portTerminal()),
                    value(data.purpose()),

                    value(data.inboundVessel()),
                    value(data.inboundVoyage()),
                    formatDate(data.dateOfArrival()),

                    value(data.outboundVessel()),
                    value(data.outboundVoyage()),
                    formatDate(data.departureDate()),
                    
                    value(data.manifestNumber()),
                    value(data.billOfLadingWayBill()),

                    value(data.controlCheckReference()),
                    value(data.verificationStatus()),

                    containerRows,

                    value(data.officerNotes()),

                    qrCodeBase64,
                    data.controlNumber()
                );
    }

    private String value(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private String formatDate(java.time.LocalDate date) {
        return date == null ? "-" : date.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
    }

    public byte[] generateTestCertificate() {
        String html = """
            <html>
                <head>
                    <style>
                    body {
                        font-family: sans-serif;
                        padding: 40px;
                    }

                    h1 {
                        text-align: center;
                    }

                    h2 {
                        text-align: center;
                    }
                    </style>
                </head>

                <body>
                    <h1>Jamaica Customs Agency</h1>
                    <h2>Transshipment Certificate</h2>

                    <p>
                    This is a test certificate generated by the transshipment system.
                    </p>
                </body>
            </html>
                """;
    
        return generatePdf(html);
    }
}
