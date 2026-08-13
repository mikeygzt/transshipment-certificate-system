package jm.gov.jca.transshipment_api.auth.verification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import jm.gov.jca.transshipment_api.user.UserAccount;

public interface EmailVerificationRepository extends JpaRepository<EmailVerificationCode, UUID> {
    
    Optional<EmailVerificationCode>
    findTopByUserAndUsedAtIsNullOrderByExpiresAtDesc(UserAccount user);

    List<EmailVerificationCode>
    findAllByUserAndUsedAtIsNull(UserAccount user);

    void deleteAllByUser(UserAccount user);
}
