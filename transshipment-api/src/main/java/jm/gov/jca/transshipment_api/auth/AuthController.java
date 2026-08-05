package jm.gov.jca.transshipment_api.auth;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jm.gov.jca.transshipment_api.auth.dto.AuthResponse;
import jm.gov.jca.transshipment_api.auth.dto.LoginRequest;
import jm.gov.jca.transshipment_api.auth.dto.ResendVerificationRequest;
import jm.gov.jca.transshipment_api.auth.dto.VerifyEmailRequest;
import jm.gov.jca.transshipment_api.user.UserService;
import jm.gov.jca.transshipment_api.user.dto.RegisterRequesterRequest;
import jm.gov.jca.transshipment_api.user.dto.UserResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;

    private final SecurityContextRepository securityContextRepository;

    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;

    private final UserService userService;

    public AuthController(
        AuthenticationManager authenticationManager,
        SecurityContextRepository securityContextRepository,
        SessionAuthenticationStrategy sessionAuthenticationStrategy,
        UserService userService
    ) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
        this.userService = userService;
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken csrfToken) {
        return csrfToken;
    }

    @PostMapping("/register")
    public UserResponse register(
        @Valid
        @RequestBody
        RegisterRequesterRequest request) {
            return userService
                .registerRequester(request);
        }

    @PostMapping("/login")
    public ResponseEntity<?> login(
        @Valid
        @RequestBody
        LoginRequest request,
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse) {

            // temp
            System.out.println("LOGIN CONTROLLER HIT " + request.email());

            try{
                Authentication authenticationRequest = 
                    UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password());
            
                Authentication authentication =
                     authenticationManager.authenticate(authenticationRequest);
                
                // temp
                System.out.println("AUTHENTICATION SUCCESS: " + authentication.getName());

                // Protect against session fixation
                sessionAuthenticationStrategy
                    .onAuthentication(authentication, httpRequest, httpResponse);
                
                System.out.println("SESSION STRATEGY SUCCESS");

                SecurityContext context = SecurityContextHolder.createEmptyContext();
                    
                context.setAuthentication(authentication);
    
                SecurityContextHolder.setContext(context);
    
                securityContextRepository
                    .saveContext(context, httpRequest, httpResponse);
                
                // temp
                System.out.println("SECURITY CONTEXT SAVED");
                
                return ResponseEntity.ok(toAuthResponse(authentication));
                
            } catch(InternalAuthenticationServiceException ex){

                // temp
                System.err.println("INTERNAL AUTHENTICATION ERROR:");
                System.err.println(ex.getMessage());

                if(ex.getCause() != null){
                    ex.getCause().printStackTrace();
                }

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Internal authentication error"));

            } catch(AuthenticationException ex){
                
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
            }
        }
        
        @GetMapping("/me")
        public AuthResponse me(Authentication authentication) {
            return toAuthResponse(authentication);
        }

        private AuthResponse toAuthResponse(Authentication authentication){
            String role = authentication
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .findFirst()
                .map(authority -> authority.substring(5))
                .orElse("UNKOWN");

            return new AuthResponse(authentication.getName(), role);
        }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(
        @Valid
        @RequestBody
        VerifyEmailRequest request
    )
    {
        // temp
        System.out.println("VERIFY EMAIL CONTROLLER REACHED");
        userService.verifyEmail(request.email(), request.code());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(
        @Valid
        @RequestBody
        ResendVerificationRequest request
    )
    {
        userService.resendVerificationCode(request.email());

        return ResponseEntity.noContent().build();
    }
}
