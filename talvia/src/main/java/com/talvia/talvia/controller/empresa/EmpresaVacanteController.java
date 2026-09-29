package com.talvia.talvia.controller.empresa;

import java.util.Map;

import com.talvia.talvia.dto.request.empresa.VacanteCreateDTO;
import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.empresa.EmpresaVacanteService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/empresa/vacantes")
public class EmpresaVacanteController {

    @Autowired private EmpresaVacanteService empresaVacanteService;

    @GetMapping
    public ResponseEntity<?> listar(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(empresaVacanteService.listarPropias(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerParaEditar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(empresaVacanteService.obtenerPropiaParaEditar(principal.getId(), id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@AuthenticationPrincipal UserPrincipal principal,
                                    @RequestBody VacanteCreateDTO dto) {
        try {
            return ResponseEntity.ok(empresaVacanteService.crear(principal.getId(), dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable Long id,
                                         @RequestBody VacanteCreateDTO dto) {
        try {
            return ResponseEntity.ok(empresaVacanteService.actualizar(principal.getId(), id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable Long id,
                                            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(empresaVacanteService.cambiarEstado(principal.getId(), id, body.get("estado")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
public ResponseEntity<?> eliminar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
    try {
        empresaVacanteService.eliminar(principal.getId(), id);
        return ResponseEntity.ok().build();
    } catch (IllegalStateException e) {
        return ResponseEntity.status(409).body(e.getMessage());
    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(403).body(e.getMessage());
    }
}
}