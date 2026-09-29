package com.talvia.talvia.config;

import com.talvia.talvia.model.enums.Rol;
import com.talvia.talvia.model.usuario.Admin;
import com.talvia.talvia.repository.usuario.AdminRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Profile("dev") // solo corre con el perfil dev; nunca en producción
public class AdminDevInitializer implements CommandLineRunner {

    private static final String EMAIL = "admin@talvia.com";
    private static final String CONTRASENA = "Admin12345";
    private static final String CODIGO_SEGURIDAD = "TALV2026"; // se escribe como TALV-2026 en el login

    @Autowired private AdminRepository adminRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (adminRepository.findByEmail(EMAIL).isPresent()) {
            return; // ya existe, no hace nada
        }

        Admin admin = new Admin();
        admin.setNombre("Administrador de prueba");
        admin.setEmail(EMAIL);
        admin.setContrasena(passwordEncoder.encode(CONTRASENA));
        admin.setTelefono("3000000000");
        admin.setRol(Rol.ADMIN);
        admin.setFechaRegistro(LocalDateTime.now());
        admin.setActivo(true); // si queda en false, el login lo trata como cuenta sin verificar
        admin.setCodigoAcceso(passwordEncoder.encode(CODIGO_SEGURIDAD));
        // admin.setNivelPermiso(...); // ajusta al tipo real de tu campo (ver nota abajo)

        adminRepository.save(admin);
        System.out.println(">>> Admin de prueba creado: " + EMAIL);
    }
}