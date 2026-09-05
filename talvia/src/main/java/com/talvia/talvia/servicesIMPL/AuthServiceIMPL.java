package com.talvia.talvia.servicesIMPL;

import com.talvia.talvia.dto.LoginRequestDTO;
import com.talvia.talvia.dto.LoginResponseDTO;
import com.talvia.talvia.model.usuario.Admin;
import com.talvia.talvia.repository.AdminRepository;
import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.security.LoginAttempService;
import com.talvia.talvia.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.security.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceIMPL implements AuthService {

    private static final String GENERIC_ERROR = "Correo, contraseña o código incorrectos.";

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private HttpServletRequest request;
    @Autowired private AdminRepository adminRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private LoginAttempService loginAttemptService;

    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {

        String correo = loginRequest.getCorreoElectronico();

        if (correo == null || loginRequest.getContrasena() == null) {
            throw new BadCredentialsException(GENERIC_ERROR);
        }

        // Verificar bloqueo ANTES de intentar autenticar
        if (loginAttemptService.estaBloqueado(correo)) {
            long minutos = loginAttemptService.minutosRestantesDeBloqueo(correo);
            throw new BadCredentialsException(
                "Demasiados intentos fallidos. Intenta de nuevo en " + minutos + " minuto(s)."
            );
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(correo, loginRequest.getContrasena())
            );
        } catch (AuthenticationException e) {
            loginAttemptService.registrarFallo(correo);
            throw new BadCredentialsException(GENERIC_ERROR);
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String role = principal.getRole();

        if ("ADMIN".equals(role)) {
            String codigo = loginRequest.getSecurityCode();
            if (codigo == null || codigo.isBlank()) {
                loginAttemptService.registrarFallo(correo);
                throw new BadCredentialsException(GENERIC_ERROR);
            }

            Admin admin = adminRepository.findByEmail(correo)
                    .orElseThrow(() -> {
                        loginAttemptService.registrarFallo(correo);
                        return new BadCredentialsException(GENERIC_ERROR);
                    });

            String codigoLimpio = codigo.replace("-", "").toUpperCase();

            if (admin.getCodigoAcceso() == null || !passwordEncoder.matches(codigoLimpio, admin.getCodigoAcceso())) {
                loginAttemptService.registrarFallo(correo);
                throw new BadCredentialsException(GENERIC_ERROR);
            }
        }

        // Login exitoso: resetear contador de intentos
        loginAttemptService.registrarExito(correo);

        // Prevención de session fixation
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession session = request.getSession(true);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext()
        );
        session.setAttribute("userId", principal.getId());
        session.setAttribute("userEmail", principal.getUsername());
        session.setAttribute("userRole", role);

        return new LoginResponseDTO(
                String.valueOf(principal.getId()),
                principal.getUsername(),
                role,
                "Inicio de sesión exitoso."
        );
    }

    @Override
    public void logout() {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
    }
}