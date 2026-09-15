package com.talvia.talvia.controller;

import com.talvia.talvia.dto.ForgotPasswordDTO;
import com.talvia.talvia.dto.request.LoginRequestDTO;
import com.talvia.talvia.dto.response.LoginResponseDTO;
import com.talvia.talvia.dto.ResetPasswordDTO;
import com.talvia.talvia.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            LoginResponseDTO response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        authService.logout();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordDTO dto) {
        authService.solicitarRecuperacionContrasena(dto.getCorreoElectronico());
        return ResponseEntity.ok("Si el correo existe, se ha enviado un código de recuperación.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO dto) {
        try {
            authService.restablecerContrasena(dto.getCorreoElectronico(), dto.getCodigo(), dto.getNuevaContrasena());
            return ResponseEntity.ok("Contraseña actualizada exitosamente.");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}