package jm.gov.jca.transshipment_api.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        SecurityContextRepository SecurityContextRepository) throws Exception {
            http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.spa())

                .securityContext(context -> 
                    context.securityContextRepository(SecurityContextRepository)
                )

                .authorizeHttpRequests(auth -> auth
                    
                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/auth/csrf"
                    ).permitAll()

                    .requestMatchers(
                        HttpMethod.POST,
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/auth/verify-email",
                        "/api/auth/resend-verification"
                    ).permitAll()

                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")

                    .requestMatchers("/api/**")
                    .authenticated()

                    .anyRequest()
                    .denyAll()
                )
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(logout -> 
                    logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler(
                            (request, response, authentication) -> 
                                response.setStatus(HttpServletResponse.SC_NO_CONTENT)
                        )
                )
                .exceptionHandling(exceptions -> 
                    exceptions
                        .authenticationEntryPoint(
                            (request, response, exception) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN)
                        )   
                        .accessDeniedHandler(
                            (request, response, exception) -> 
                                response.sendError(
                                    HttpServletResponse.SC_FORBIDDEN
                                )
                        )
                );
        return http.build(); 
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories
            .createDelegatingPasswordEncoder();
    }

    @Bean 
    public AuthenticationManager authenticationManager(
        UserDetailsService userDetailsService,
        PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return new ProviderManager(provider);
    }

    @Bean
    public SecurityContextRepository securityContextRepository(){
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SessionAuthenticationStrategy sessionAuthenticationStrategy(){
        return new ChangeSessionIdAuthenticationStrategy();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:4200"));

        config.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        config.setAllowedHeaders(
            List.of("*")
        );

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
