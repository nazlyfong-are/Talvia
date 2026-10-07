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
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;

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

        XorCsrfTokenRequestAttributeHandler delegate = new XorCsrfTokenRequestAttributeHandler();
        // Fuerza que el token se genere y la cookie XSRF-TOKEN salga desde la primera respuesta
        delegate.setCsrfRequestAttributeName(null);
        // Usa solo handle() del Xor; para leer el token enviado se queda con la resolución
        // por defecto (header X-XSRF-TOKEN), que acepta el valor tal cual está en la cookie
        CsrfTokenRequestHandler requestHandler = delegate::handle;

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(requestHandler)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/", "/public/**", "/css/**", "/js/**", "/img/**",
                    "/api/auth/**", "/api/register/**",
                    "/api/vacantes/**", "/api/empresas/**",
                    "/error"
                ).permitAll()

                .requestMatchers("/private/admin/**").hasRole("ADMIN")
                .requestMatchers("/private/trabajador/**").hasRole("TRABAJADOR")
                .requestMatchers("/private/empresa/**").hasRole("EMPRESA")

                .requestMatchers("/api/trabajador/**").hasRole("TRABAJADOR")
                .requestMatchers("/api/postulaciones/**").hasRole("TRABAJADOR")
                .requestMatchers("/api/empresa/**").hasRole("EMPRESA")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/cuenta/**").authenticated()
                .requestMatchers("/api/notificaciones/**").authenticated()

                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}