package jm.gov.jca.transshipment_api.user;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="users")
public class UserAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

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
    private LocalDateTime createdAt;

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

    // Adding 'created_at' before the entity is saved to the database
    @PrePersist
    void beforeInsert(){
        this.createdAt = LocalDateTime.now();
    }
    
    public UUID getId(){
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

    public LocalDateTime getCreatedAt(){
        return createdAt;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setPassword(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setCompanyTrn(String companyTrn) {
        this.companyTRN = companyTrn;
    }

    public void setShippingAgentName(String shippingAgentName){
        this.shippingAgentName = shippingAgentName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setStatus(Status status){
        this.status = status;
    }
}
