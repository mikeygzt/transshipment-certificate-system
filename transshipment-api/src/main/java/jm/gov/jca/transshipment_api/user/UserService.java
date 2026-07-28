package jm.gov.jca.transshipment_api.user;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.annotation.Transactional;
import jm.gov.jca.transshipment_api.user.dto.AdminCreateUserRequest;
import jm.gov.jca.transshipment_api.user.dto.RegisterRequesterRequest;
import jm.gov.jca.transshipment_api.user.dto.UserResponse;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse registerRequester(RegisterRequesterRequest request){
        return createUser(
            request.fullName(),
            request.telephone(),
            request.companyTRN(),
            request.shippingAgentName(),
            request.email(),
            request.password(),
            Role.REQUESTER
        );
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createByAdmin(AdminCreateUserRequest request){
        return createUser(
            request.fullName(),
            request.telephone(),
            request.companyTRN(),
            request.shippingAgentName(),
            request.email(),
            request.password(),
            request.role()
        );
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers(){
        return userRepository.findAll()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long userId){
        UserAccount user = userRepository
        .findById(userId)
        .orElseThrow(() -> 
            new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
            
        );

        if (user.getRole() == Role.ADMIN 
            && userRepository.countByRole(Role.ADMIN) <= 1
        ){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "The final administrator cannot be deleted");
        }

        userRepository.delete(user);
    }

    private UserResponse createUser(
        String fullName,
        String telephone,
        String companyTRN,
        String shippingAgentName,
        String email,
        String rawPassword,
        Role role
    ){
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "An account with that email already exists.");
        }

        UserAccount user = new UserAccount(
            fullName,
            telephone,
            companyTRN,
            shippingAgentName,
            normalizedEmail, 
            passwordEncoder.encode(rawPassword), 
            role);

        UserAccount saved = userRepository.save(user);
        return toResponse(saved);
    }

    private UserResponse toResponse(UserAccount user) {
        return new UserResponse(
            user.getId(),
            user.getFullName(),
            user.getTelephone(),
            user.getCompanyTrn(),
            user.getShippingAgentName(),
            user.getEmail(),
            user.getRole(),
            user.getStatus(),
            user.getCreatedAt()
        );
    }

}
