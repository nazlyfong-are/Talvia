package com.talvia.talvia.controller.empresa;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.trabajador.PostulacionService;

@RestController
@RequestMapping("/api/empresa/postulaciones")
public class EmpresaPostulacionController {

    @Autowired private PostulacionService postulacionService;

    @GetMapping
    public ResponseEntity<?> listar(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }
        return ResponseEntity.ok(postulacionService.listarPorEmpresa(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detalle(@AuthenticationPrincipal UserPrincipal principal,
                                      @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }
        try {
            return ResponseEntity.ok(postulacionService.obtenerDetalle(principal.getId(), id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable Long id,
                                               @RequestBody Map<String, String> body) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }

        try {
            String nuevoEstado = body.get("estado");
            if (nuevoEstado == null || nuevoEstado.isBlank()) {
                return ResponseEntity.badRequest().body("El campo 'estado' es obligatorio.");
            }

            postulacionService.actualizarEstado(principal.getId(), id, nuevoEstado);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}