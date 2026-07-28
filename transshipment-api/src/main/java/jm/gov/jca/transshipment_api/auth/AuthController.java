package jm.gov.jca.transshipment_api.auth;

import org.springframework.security.authentication.AuthenticationManager;
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
    public AuthResponse login(
        @Valid
        @RequestBody
        LoginRequest request,
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse) {
            Authentication authenticationRequest = 
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password());
        
            Authentication authentication = authenticationManager.authenticate(authenticationRequest);

            // Protect against session fixation
            sessionAuthenticationStrategy
                .onAuthentication(authentication, httpRequest, httpResponse);
            
            SecurityContext context =
                SecurityContextHolder
                    .createEmptyContext();
                
            context.setAuthentication(authentication);

            SecurityContextHolder
                .setContext(context);

            securityContextRepository
                .saveContext(context, httpRequest, httpResponse);
            
            return toAuthResponse(authentication);
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
}
