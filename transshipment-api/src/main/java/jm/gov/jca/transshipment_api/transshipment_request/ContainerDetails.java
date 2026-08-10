package jm.gov.jca.transshipment_api.transshipment_request;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name="Container Details")
public class ContainerDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID containerId;

    @ManyToOne
    @JoinColumn(
            nullable = false,
            name = "request_id"
    )
    private TransshipmentRequest request;

    @Column(
            nullable = false,
            length = 20,
            name = "container_number"
    )
    private String containerNumber;

    @Column(
            nullable = true,
            length = 50,
            name = "seal_number"
    )
    private String sealNumber;

    @Column(
            nullable = false,
            length = 50,
            name = "size_type"
    )
    private String sizeType;

    @Column(
            nullable = true,
            length = 512,
            columnDefinition = "TEXT",
            name = "cargo_description"
    )
    private String cargoDescription;

    @Column(
            nullable = true,
            name = "packages"
    )
    private int packages;

    @Column(
            nullable = true,
            precision = 12,
            scale = 2,
            name = "gross_weight_kg"
    )
    private BigDecimal grossWeightKg;

    @Column(
            nullable = true,
            length = 100,
            name="yard_location"
    )
    private String yardLocation;

    @Column(
            nullable = true,
            length = 100,
            name="origin"
    )
    private String origin;

    @Column(
            nullable = true,
            length = 100,
            name="final_destination"
    )
    private String finalDestination;

    protected ContainerDetails(){}

    public ContainerDetails(
            TransshipmentRequest request,
            String containerNumber,
            String sealNumber,
            String sizeType,
            String cargoDescription,
            int packages,
            BigDecimal grossWeightKg,
            String yardLocation,
            String origin,
            String finalDestination
    ) {
        this.request = request;
        this.containerNumber = containerNumber;
        this.sealNumber = sealNumber;
        this.sizeType = sizeType;
        this.cargoDescription = cargoDescription;
        this.packages = packages;
        this.grossWeightKg = grossWeightKg;
        this.yardLocation = yardLocation;
        this.origin = origin;
        this.finalDestination = finalDestination;
    }

    public UUID getContainerId() {
        return containerId;
    }

    public TransshipmentRequest getRequestId() {
        return request;
    }

    public String getContainerNumber() {
        return containerNumber;
    }

    public String getSealNumber() {
        return sealNumber;
    }

    public String getSizeType() {
        return sizeType;
    }

    public String getCargoDescription() {
        return cargoDescription;
    }

    public int getPackages() {
        return packages;
    }

    public BigDecimal getGrossWeightKg() {
        return grossWeightKg;
    }

    public String getYardLocation() {
        return yardLocation;
    }

    public String getOrigin() {
        return origin;
    }

    public String getFinalDestination() {
        return finalDestination;
    }

    public void setRequestId(TransshipmentRequest request) {
        this.request = request;
    }

    public void setContainerNumber(String containerNumber) {
        this.containerNumber = containerNumber;
    }

    public void setSealNumber(String sealNumber) {
        this.sealNumber = sealNumber;
    }

    public void setSizeType(String sizeType) {
        this.sizeType = sizeType;
    }

    public void setCargoDescription(String cargoDescription) {
        this.cargoDescription = cargoDescription;
    }

    public void setPackages(int packages) {
        this.packages = packages;
    }

    public void setGrossWeightKg(BigDecimal grossWeightKg) {
        this.grossWeightKg = grossWeightKg;
    }

    public void setYardLocation(String yardLocation) {
        this.yardLocation = yardLocation;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public void setFinalDestination(String finalDestination) {
        this.finalDestination = finalDestination;
    }

}