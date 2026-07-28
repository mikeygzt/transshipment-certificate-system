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

    protected UserAccount(){}

    public UserAccount(
        String fullName,
        String telephone,
        String companyTRN,
        String shippingAgentName,
        String email,
        String passwordHash,
        Role role
    ){
        this.fullName = fullName;
        this.telephone = telephone;
        this.companyTRN = companyTRN;
        this.shippingAgentName = shippingAgentName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    // Adding 'created_at' & 'pending_confirmation' before the entity is saved to the database
    @PrePersist
    void beforeInsert(){
        this.createdAt = OffsetDateTime.now();
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
