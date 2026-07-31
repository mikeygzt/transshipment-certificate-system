package jm.gov.jca.transshipment_api.auth;

import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import jm.gov.jca.transshipment_api.user.Status;
import jm.gov.jca.transshipment_api.user.UserAccount;
import jm.gov.jca.transshipment_api.user.UserRepository;

@Service
public class DatabaseUserDetailsService implements UserDetailsService{
    private final UserRepository userRepository;

    public DatabaseUserDetailsService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // temp
        System.out.println("Looking up user ["+ email + "]");

        UserAccount user = userRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> {
                System.out.println("USER NOT FOUND");
               return new UsernameNotFoundException("Invalid email or password");
            }
            );

        // temp
        System.out.println("USER FOUND: " + user.getEmail());
        System.out.println("ROLE: " + user.getRole());
        
        boolean loginDisabled = user.getStatus() != Status.ACTIVE;

        return User
            .withUsername(user.getEmail())
            .password(user.getPasswordHash())
            .roles(user.getRole().name())
            .disabled(loginDisabled)
            .build();
    }
}
