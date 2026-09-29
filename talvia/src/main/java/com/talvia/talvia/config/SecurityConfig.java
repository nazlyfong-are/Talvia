package com.talvia.talvia.config;

import com.talvia.talvia.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired private UserDetailsServiceImpl userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers(
    "/api/auth/**",
    "/api/register/**",
    "/api/trabajador/**",
    "/api/empresa/**",
    "/api/postulaciones/**",
    "/api/cuenta/**",
    "/api/notificaciones/**",
    "/api/admin/**"
)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/", "/public/**", "/css/**", "/js/**", "/img/**",
                    "/api/auth/**", "/api/register/**",
                    "/api/vacantes/**", "/api/empresas/**","/api/notificaciones/**",
                    "/error"
                ).permitAll()

                .requestMatchers("/private/admin/**").hasRole("ADMIN")
                .requestMatchers("/private/trabajador/**").hasRole("TRABAJADOR")
                .requestMatchers("/private/empresa/**").hasRole("EMPRESA")
                .requestMatchers("/api/notificaciones/**").authenticated()
                .requestMatchers("/api/trabajador/**").hasRole("TRABAJADOR")
                .requestMatchers("/api/postulaciones/**").hasRole("TRABAJADOR")
                .requestMatchers("/api/empresa/**").hasRole("EMPRESA")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/cuenta/**").authenticated()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}