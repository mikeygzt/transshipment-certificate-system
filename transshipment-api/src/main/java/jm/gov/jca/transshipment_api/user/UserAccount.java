package jm.gov.jca.transshipment_api.user;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name="users")
public class UserAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        nullable = false,
        unique = true,
        length = 254
    )
    private String email;

    @Column(
        name = "password_hash",
        nullable = false
    )
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 50
    )
    private Role role;

    @Column(
        name = "company_trn",
        nullable = false,
        length = 13
    )
    private String companyTRN;

    @Column(
        name = "shipping_agent_name",
        nullable = false
    )
    private String shippingAgentName;

    @Column(
        name = "full_name",
        nullable = false
    )
    private String fullName;

    @Column(
        nullable = false,
        length = 12
    )
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 20
    )
    private Status status;

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    private OffsetDateTime createdAt;

    public UserAccount(
        String fullName,
        String telephone,
        String companyTRN,
        String shippingAgentName,
        String email,
        String password,
        Role role
    ){
        this.fullName = fullName;
        this.telephone = telephone;
        this.companyTRN = companyTRN;
        this.shippingAgentName = shippingAgentName;
        this.email = email;
        this.passwordHash = password;
        this.role = role;
    }

    // Adding the timestamp to 'created_at' before the entity is saved to the database
    @PrePersist
    void beforeInsertAddTimeStamp(){
        this.createdAt = OffsetDateTime.now();
    }

    // Adding 'pending confirmation' before the entity is saved to the database
    @PrePersist
    void beforeInsertAddStatus(){
        this.status = Status.PENDING_CONFIRMATION;
    }
    
    public Long getId(){
        return id;
    }

    public String getEmail(){
        return email;
    }

    public String getPasswordHash(){
        return passwordHash;
    }

    public Role getRole(){
        return role;
    }

    public String getCompanyTrn(){
        return companyTRN;
    }

    public String getShippingAgentName(){
        return shippingAgentName;
    }

    public String getFullName(){
        return fullName;
    }

    public String getTelephone(){
        return telephone;
    }
    
    public Status getStatus(){
        return status;
    }

    public OffsetDateTime getCreatedAt(){
        return createdAt;
    }

    public void setStatus(Status status){
        this.status = status;
    }
}
