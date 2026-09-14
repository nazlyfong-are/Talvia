package com.talvia.talvia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.dto.request.VacanteCreateDTO;
import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.EmpresaVacanteService;

@RestController
@RequestMapping("/api/empresa/vacantes")
public class EmpresaVacanteController {

    @Autowired
    private EmpresaVacanteService empresaVacanteService;

    @GetMapping
    public ResponseEntity<?> listar(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }
        return ResponseEntity.ok(empresaVacanteService.listarPropias(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<?> crear(@AuthenticationPrincipal UserPrincipal principal,
                                   @RequestBody VacanteCreateDTO dto) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }
        try {
            return ResponseEntity.ok(empresaVacanteService.crear(principal.getId(), dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }
        try {
            empresaVacanteService.eliminar(principal.getId(), id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}