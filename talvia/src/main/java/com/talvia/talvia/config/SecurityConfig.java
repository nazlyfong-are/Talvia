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

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

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
            // CSRF desactivado para las APIs propias del backend (login/registro no tienen
            // sesión previa aún; trabajador/empresa/postulaciones lo desactivamos por el
            // comportamiento inconsistente que encontramos con el token en esta versión
            // de Spring Security). Mismo trade-off consciente en las cuatro rutas.
            .csrf(csrf -> csrf
                .ignoringRequestMatchers(
                    "/api/auth/**",
                    "/api/register/**",
                    "/api/trabajador/**",
                    "/api/empresa/**",
                    "/api/postulaciones/**"
                )
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(auth -> auth
                // Público: assets, auth, registro, vacantes/empresas de solo lectura, y /error
                .requestMatchers(
                    "/", "/public/**", "/css/**", "/js/**", "/img/**",
                    "/api/auth/**", "/api/register/**",
                    "/api/vacantes/**", "/api/empresas/**",
                    "/error"
                ).permitAll()

                // Vistas protegidas por rol
                .requestMatchers("/private/admin/**").hasRole("ADMIN")
                .requestMatchers("/private/trabajador/**").hasRole("TRABAJADOR")
                .requestMatchers("/private/empresa/**").hasRole("EMPRESA")

                // APIs protegidas por rol
                .requestMatchers("/api/trabajador/**").hasRole("TRABAJADOR")
                .requestMatchers("/api/postulaciones/**").hasRole("TRABAJADOR")
                .requestMatchers("/api/empresa/**").hasRole("EMPRESA")

                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}