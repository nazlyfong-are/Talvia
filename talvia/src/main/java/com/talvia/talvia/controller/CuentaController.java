package com.talvia.talvia.controller;

import com.talvia.talvia.dto.EliminarCuentaDTO;
import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cuenta")
public class CuentaController {

    @Autowired
    private AuthService authService;

    @PostMapping("/eliminar/solicitar")
    public ResponseEntity<?> solicitar(@AuthenticationPrincipal UserPrincipal principal) {
        authService.solicitarEliminacionCuenta(principal.getId(), principal.getUsername());
        return ResponseEntity.ok("Código de confirmación enviado a tu correo.");
    }

    @PostMapping("/eliminar/confirmar")
    public ResponseEntity<?> confirmar(@AuthenticationPrincipal UserPrincipal principal,
                                        @RequestBody EliminarCuentaDTO dto) {
        try {
            authService.confirmarEliminacionCuenta(principal.getId(), principal.getUsername(), dto.getCodigo());
            return ResponseEntity.ok("Cuenta eliminada exitosamente.");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}