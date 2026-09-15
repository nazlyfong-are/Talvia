package com.talvia.talvia.servicesIMPL;

import com.talvia.talvia.dto.request.LoginRequestDTO;
import com.talvia.talvia.dto.response.LoginResponseDTO;
import com.talvia.talvia.model.enums.TipoCodigo;
import com.talvia.talvia.model.proceso.Postulacion;
import com.talvia.talvia.model.usuario.Admin;
import com.talvia.talvia.model.usuario.Empresa;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.usuario.Usuario;
import com.talvia.talvia.model.vacante.Vacante;
import com.talvia.talvia.repository.AdminRepository;
import com.talvia.talvia.repository.PostulacionRepository;
import com.talvia.talvia.repository.UsuarioRepository;
import com.talvia.talvia.repository.VacanteRepository;
import com.talvia.talvia.security.LoginAttempService;
import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.AuthService;
import com.talvia.talvia.services.CodigoVerificacionService;
import com.talvia.talvia.services.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthServiceIMPL implements AuthService {

    private static final String GENERIC_ERROR = "Correo, contraseña o código incorrectos.";

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private LoginAttempService loginAttemptService;

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private CodigoVerificacionService codigoVerificacionService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private PostulacionRepository postulacionRepository;
    @Autowired
    private VacanteRepository vacanteRepository;

    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {

        String correo = loginRequest.getCorreoElectronico();

        if (correo == null || loginRequest.getContrasena() == null) {
            throw new BadCredentialsException(GENERIC_ERROR);
        }

        if (loginAttemptService.estaBloqueado(correo)) {
            long minutos = loginAttemptService.minutosRestantesDeBloqueo(correo);
            throw new BadCredentialsException(
                    "Demasiados intentos fallidos. Intenta de nuevo en " + minutos + " minuto(s).");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(correo, loginRequest.getContrasena()));
        } catch (DisabledException e) {
            throw new BadCredentialsException(
                    "Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.");
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

        loginAttemptService.registrarExito(correo);

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession session = request.getSession(true);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());
        session.setAttribute("userId", principal.getId());
        session.setAttribute("userEmail", principal.getUsername());
        session.setAttribute("userRole", role);

        return new LoginResponseDTO(
                String.valueOf(principal.getId()),
                principal.getUsername(),
                role,
                "Inicio de sesión exitoso.");
    }

    @Override
    public void logout() {
        HttpSession session = request.getSession(false);
        if (session != null)
            session.invalidate();
        SecurityContextHolder.clearContext();
    }

    /* ================= Recuperar contraseña ================= */

    @Override
    public void solicitarRecuperacionContrasena(String email) {
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            return; // No revelamos si el correo existe o no
        }
        String codigo = codigoVerificacionService.generarCodigo(email, TipoCodigo.RECUPERAR_CONTRASENA);
        emailService.enviarCorreoSimple(email, "Recupera tu contraseña en Talvia",
                PlantillasEmail.codigoRecuperarContrasena(codigo));
    }

    @Override
    public void restablecerContrasena(String email, String codigo, String nuevaContrasena) {
        boolean valido = codigoVerificacionService.validarCodigo(email, TipoCodigo.RECUPERAR_CONTRASENA, codigo);
        if (!valido) {
            throw new BadCredentialsException("Código inválido o expirado.");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Código inválido o expirado."));

        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuarioRepository.save(usuario);
    }

    /* ================= Eliminar cuenta ================= */

    @Override
    public void solicitarEliminacionCuenta(Long usuarioId, String email) {
        String codigo = codigoVerificacionService.generarCodigo(email, TipoCodigo.ELIMINAR_CUENTA);
        emailService.enviarCorreoSimple(email, "Confirma la eliminación de tu cuenta",
                PlantillasEmail.codigoEliminarCuenta(codigo));
    }

    @Override
    @Transactional
    public void confirmarEliminacionCuenta(Long usuarioId, String email, String codigo) {
        boolean valido = codigoVerificacionService.validarCodigo(email, TipoCodigo.ELIMINAR_CUENTA, codigo);
        if (!valido) {
            throw new BadCredentialsException("Código inválido o expirado.");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado."));

        // Borra postulaciones donde el usuario es el trabajador
        postulacionRepository.deleteAll(postulacionRepository.findByTrabajadorId(usuarioId));

        // Borra postulaciones recibidas en las vacantes de esta empresa (si aplica)
        List<Vacante> vacantesDeEmpresa = vacanteRepository.findByEmpresaId(usuarioId);
        for (Vacante v : vacantesDeEmpresa) {
            postulacionRepository.deleteAll(postulacionRepository.findByVacanteId(v.getId()));
        }

        usuarioRepository.delete(usuario);
        SecurityContextHolder.clearContext();
    }

    @Override
    public void verificarCorreo(String email, String codigo) {
        boolean valido = codigoVerificacionService.validarCodigo(email, TipoCodigo.VERIFICAR_CORREO, codigo);
        if (!valido) {
            throw new BadCredentialsException("Código inválido o expirado.");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado."));

        usuario.setActivo(true);
        usuarioRepository.save(usuario);

        // Correo de bienvenida, ahora que la cuenta ya quedó verificada
        if (usuario instanceof Trabajador t) {
            emailService.enviarCorreoSimple(email, "¡Bienvenido a Talvia!",
                    PlantillasEmail.bienvenidaTrabajador(t.getNombre()));
        } else if (usuario instanceof Empresa e) {
            emailService.enviarCorreoSimple(email, "¡Bienvenido a Talvia!",
                    PlantillasEmail.bienvenidaEmpresa(e.getRazonSocial()));
        }
    }

    @Override
    public void reenviarCodigoVerificacion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null || usuario.isActivo()) {
            return; // no revelamos si el correo existe; si ya está activo, no hacemos nada
        }
        String codigo = codigoVerificacionService.generarCodigo(email, TipoCodigo.VERIFICAR_CORREO);
        emailService.enviarCorreoSimple(email, "Verifica tu correo en Talvia",
                PlantillasEmail.codigoVerificacionCorreo(usuario.getNombre(), codigo));
    }
}