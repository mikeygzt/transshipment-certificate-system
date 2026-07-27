package jm.gov.jca.transshipment_api.auth;

import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

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
        UserAccount user = userRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> 
                new UsernameNotFoundException("Invalid email or password")
            );
        
        return User
            .withUsername(user.getEmail())
            .password(user.getPasswordHash())
            .roles(user.getRole().name())
            .build();
    }
}
