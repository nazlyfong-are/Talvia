package com.talvia.talvia.servicesIMPL;

import com.talvia.talvia.model.adminModel;
import com.talvia.talvia.model.superAdminModel;
import com.talvia.talvia.model.workerModel;
import com.talvia.talvia.repository.AdminRepository;
import com.talvia.talvia.repository.SuperAdminRepository;
import com.talvia.talvia.repository.WorkerRepository;
import com.talvia.talvia.dto.LoginRequestDTO;
import com.talvia.talvia.dto.LoginResponseDTO;
import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceIMPL implements AuthService {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private HttpServletRequest    request;
    @Autowired private SuperAdminRepository  superAdminRepository;
    @Autowired private AdminRepository       adminRepository;
    @Autowired private WorkerRepository      workerRepository;

    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        System.out.println(">>> LOGIN: " + loginRequest.getCorreoElectronico());

        if (loginRequest.getCorreoElectronico() == null || loginRequest.getContrasena() == null)
            throw new BadCredentialsException("Correo y contraseña son obligatorios.");

        // Autenticar con Spring Security (verifica correo + contraseña)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getCorreoElectronico(),
                        loginRequest.getContrasena()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        HttpSession session = request.getSession(true);
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext()
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String role  = principal.getRole();
        String correo = loginRequest.getCorreoElectronico();
        String codigo = loginRequest.getSecurityCode();

        // ── Validar código de acceso según rol ──
        switch (role) {

            case "SUPER_ADMIN" -> {
                if (codigo == null || codigo.isBlank())
                    throw new BadCredentialsException(
                        "El código de acceso es obligatorio.");
                superAdminModel sa = superAdminRepository
                        .findByCorreoElectronico(correo)
                        .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado."));
                // Comparar código limpio (sin guión)
                String codigoLimpio = codigo.replace("-", "").toUpperCase();
                String saCodigoLimpio = sa.getCodigoAcceso() != null
                        ? sa.getCodigoAcceso().replace("-", "").toUpperCase() : "";
                if (!codigoLimpio.equals(saCodigoLimpio))
                    throw new BadCredentialsException("Código de acceso incorrecto.");
            }

            case "ADMIN" -> {
                if (codigo == null || codigo.isBlank())
                    throw new BadCredentialsException(
                        "El código de acceso es obligatorio para administradores.");
                adminModel admin = adminRepository
                        .findByCorreoElectronico(correo)
                        .orElseThrow(() -> new BadCredentialsException("Admin no encontrado."));
                String codigoLimpio = codigo.replace("-", "").toUpperCase();
                String adminCodigoLimpio = admin.getCodigoAcceso() != null
                        ? admin.getCodigoAcceso().replace("-", "").toUpperCase() : "";
                if (!codigoLimpio.equals(adminCodigoLimpio))
                    throw new BadCredentialsException("Código de acceso incorrecto.");
            }

            case "TRABAJADOR" -> {
                if (codigo == null || codigo.isBlank())
                    throw new BadCredentialsException(
                        "El código de acceso es obligatorio para trabajadores.");
                workerModel worker = workerRepository.findByCorreoElectronico(correo);
                if (worker == null)
                    throw new BadCredentialsException("Trabajador no encontrado.");
                String codigoLimpio = codigo.replace("-", "").toUpperCase();
                String workerCodigoLimpio = worker.getCodigoAcceso() != null
                        ? worker.getCodigoAcceso().replace("-", "").toUpperCase() : "";
                if (!codigoLimpio.equals(workerCodigoLimpio))
                    throw new BadCredentialsException("Código de acceso incorrecto.");
            }
        }

        // Guardar datos en sesión
        session.setAttribute("userId",    principal.getId());
        session.setAttribute("userEmail", principal.getUsername());
        session.setAttribute("userRole",  role);

        System.out.println(">>> ROL: " + role + " | ID: " + principal.getId());

        return new LoginResponseDTO(
                principal.getId(), principal.getUsername(), role,
                "Inicio de sesión exitoso.");
    }

    @Override
    public void logout() {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
    }
}