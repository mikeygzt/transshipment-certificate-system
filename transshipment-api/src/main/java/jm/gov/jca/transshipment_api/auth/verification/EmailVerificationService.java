package jm.gov.jca.transshipment_api.auth.verification;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jm.gov.jca.transshipment_api.user.UserAccount;

@Service
public class EmailVerificationService {
    
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final EmailVerificationRepository verificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    public EmailVerificationService(
        EmailVerificationRepository verificationRepository,
        PasswordEncoder passwordEncoder,
        MailService mailService
    ){
        this.verificationRepository = verificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;

    }

    // This generates a six digit code
    private String generateCode(){
        int number = SECURE_RANDOM.nextInt(900000) + 100000;
        return String.valueOf(number);
    }

    public void createVerificationCode(UserAccount user){

        // Making sure that only one verification code can be active at a time
        List<EmailVerificationCode> existingCodes = verificationRepository
            .findAllByUserAndUsedAtIsNull(user);

        LocalDateTime now = LocalDateTime.now();

        for (EmailVerificationCode existingCode : existingCodes) {
            existingCode.setUsedAt(now);
        }

        verificationRepository.saveAll(existingCodes);

        String code = generateCode();

        String codeHash = passwordEncoder.encode(code);

        EmailVerificationCode verification = new EmailVerificationCode(
            user,
            codeHash,
            LocalDateTime.now().plusMinutes(10)
        );

        verificationRepository.save(verification);

        mailService.sendVerificationCode(user.getEmail(), code);
    }

    public void verifyCode(UserAccount user, String submittedCode){

        EmailVerificationCode verification = verificationRepository

            // This finds the first record from the user, (findByTopUser)
            // where the code has not been used, (UsedAtIsNull)
            // and put the latest code first if there are multiple (OrderByExpiresAtDesc)
            .findTopByUserAndUsedAtIsNullOrderByExpiresAtDesc(user)
            .orElseThrow(() -> 
                new IllegalArgumentException("No verification code found")
        );

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        if(!passwordEncoder.matches(submittedCode, verification.getCodeHash())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        verification.setUsedAt(LocalDateTime.now());

        verificationRepository.save(verification);
    }
}
