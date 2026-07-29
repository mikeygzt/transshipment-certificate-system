package jm.gov.jca.transshipment_api.auth.verification;

import org.springframework.stereotype.Service;

@Service
public class MailService {
    
    public void sendVerificationCode(String email, String code){
            System.out.println(
                "DEV EMAIL TO: " + email + 
                "  | Verification Code: " + code);
    }
}
