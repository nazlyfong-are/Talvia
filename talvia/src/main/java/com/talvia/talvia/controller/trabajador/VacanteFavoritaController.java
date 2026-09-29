package com.talvia.talvia.controller.trabajador;

import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.trabajador.VacanteFavoritaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trabajador/favoritos")
public class VacanteFavoritaController {

    @Autowired
    private VacanteFavoritaService favoritaService;

    @GetMapping
    public ResponseEntity<?> listar(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(favoritaService.listar(principal.getId()));
    }

    @PostMapping("/{vacanteId}")
    public ResponseEntity<?> agregar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long vacanteId) {
        try {
            favoritaService.agregar(principal.getId(), vacanteId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @DeleteMapping("/{vacanteId}")
    public ResponseEntity<?> quitar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long vacanteId) {
        favoritaService.quitar(principal.getId(), vacanteId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/verificar/{vacanteId}")
    public ResponseEntity<?> verificar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long vacanteId) {
        boolean favorita = favoritaService.esFavorita(principal.getId(), vacanteId);
        return ResponseEntity.ok(Map.of("favorita", favorita));
    }
}