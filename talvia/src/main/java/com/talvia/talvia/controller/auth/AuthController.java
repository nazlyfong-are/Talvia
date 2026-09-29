package com.talvia.talvia.controller.auth;

import com.talvia.talvia.services.auth.AuthService;
import com.talvia.talvia.dto.request.auth.ForgotPasswordDTO;
import com.talvia.talvia.dto.request.auth.LoginRequestDTO;
import com.talvia.talvia.dto.request.auth.ResetPasswordDTO;
import com.talvia.talvia.dto.request.auth.VerificarCorreoDTO;
import com.talvia.talvia.dto.response.auth.LoginResponseDTO;

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

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerificarCorreoDTO dto) {
        try {
            authService.verificarCorreo(dto.getCorreoElectronico(), dto.getCodigo());
            return ResponseEntity.ok("Correo verificado exitosamente.");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody ForgotPasswordDTO dto) {
        authService.reenviarCodigoVerificacion(dto.getCorreoElectronico());
        return ResponseEntity.ok("Si la cuenta existe y no ha sido verificada, se reenviará un código.");
    }
}