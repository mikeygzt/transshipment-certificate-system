package jm.gov.jca.transshipment_api.auth.verification;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jm.gov.jca.transshipment_api.user.UserAccount;

@Entity
@Table(name="email_verification_code")
public class EmailVerificationCode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(nullable = false)
    private String codeHash;

    @Column(nullable = false)
    private OffsetDateTime expiresAt;

    @Column OffsetDateTime usedAt;

    protected EmailVerificationCode(){}

    public EmailVerificationCode(
        UserAccount user, 
        String codeHash, 
        OffsetDateTime expiresAt
    ){
        
        this.user = user;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
    }

    public UUID getId(){
        return this.id;
    }

    public UserAccount getUser(){
        return this.user;
    }

    public String getCodeHash(){
        return this.codeHash;
    }

    public OffsetDateTime getExpiresAt(){
        return this.expiresAt;
    }

    public OffsetDateTime getUsedAt(){
        return this.usedAt;
    }
    
    public void setUsedAt(OffsetDateTime usedAt){
        this.usedAt = usedAt;
    }
}
