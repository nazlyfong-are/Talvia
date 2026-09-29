package com.talvia.talvia.controller.trabajador;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.dto.request.trabajador.PostulacionCreateDTO;
import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.trabajador.PostulacionService;

@RestController
@RequestMapping("/api/postulaciones")
public class PostulacionController {

    @Autowired private PostulacionService postulacionService;

    @PostMapping
    public ResponseEntity<?> postularse(@AuthenticationPrincipal UserPrincipal principal, // <-- UserPrincipal en vez de
                                                                                          // Usuario
            @RequestBody PostulacionCreateDTO dto) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado.");
        }

        try {
            postulacionService.postularse(principal.getId(), dto);
            return ResponseEntity.ok(Map.of("mensaje", "Postulación enviada exitosamente."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/verificar/{vacanteId}")
    public ResponseEntity<?> verificar(@AuthenticationPrincipal UserPrincipal principal, // <-- UserPrincipal en vez de
                                                                                         // Usuario
            @PathVariable Long vacanteId) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado.");
        }

        boolean postulado = postulacionService.yaPostulo(principal.getId(), vacanteId);
        return ResponseEntity.ok(Map.of("postulado", postulado));
    }

    @GetMapping("/mias")
    public ResponseEntity<?> listarMias(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(postulacionService.listarPorTrabajador(principal.getId()));
    }
}