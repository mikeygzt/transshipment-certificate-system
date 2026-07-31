package jm.gov.jca.transshipment_api.bootstrap;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jm.gov.jca.transshipment_api.user.Role;
import jm.gov.jca.transshipment_api.user.Status;
import jm.gov.jca.transshipment_api.user.UserAccount;
import jm.gov.jca.transshipment_api.user.UserRepository;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final String adminFullName;
    private final String adminTelephone;
    private final String companyTRN;
    private final String shippingAgentName;
    private final String adminEmail;
    private final String adminPassword;

    public AdminBootstrap(
        UserRepository userRepository, 
        PasswordEncoder passwordEncoder,

        @Value("${app.bootstrap-admin.fullName:}")
        String adminFullName,
       
        @Value("${app.bootstrap-admin.telephone:}")
        String adminTelephone,
       
        @Value("${app.bootstrap-admin.companyTRN:}")
        String companyTRN,
        
        @Value("${app.bootstrap-admin.shippingAgentName:}")
        String shippingAgentName,

        @Value("${app.bootstrap-admin.email:}")
        String adminEmail,

        @Value("${app.bootstrap-admin.password:}")
        String adminPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminFullName = adminFullName;
        this.adminTelephone = adminTelephone;
        this.companyTRN = companyTRN;
        this.shippingAgentName = shippingAgentName;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        if(
            adminFullName.isBlank()
            ||
            adminTelephone.isBlank()
            ||
            companyTRN.isBlank()
            || 
            shippingAgentName.isBlank()
            ||
            adminEmail.isBlank() 
            ||
             adminPassword.isBlank() 
        ){
            return;
        }

        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }

        
        String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
        UserAccount admin = 
            new UserAccount(
                this.adminFullName,
                this.adminTelephone,
                this.companyTRN,
                this.shippingAgentName,
                normalizedEmail,
                passwordEncoder.encode(adminPassword),
                Role.ADMIN
            );
        
        admin.setStatus(Status.ACTIVE);

        userRepository.save(admin);

        System.out.println("Initial administrator created.");
    }

    public String normalizeString(String string){
        return string.trim();
    }
}
