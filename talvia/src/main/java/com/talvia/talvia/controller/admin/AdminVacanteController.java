package com.talvia.talvia.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.talvia.talvia.services.admin.AdminVacanteService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/vacantes")
public class AdminVacanteController {

    @Autowired
    private AdminVacanteService vacanteService;

    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page) {
        try {
            return ResponseEntity.ok(vacanteService.listar(estado, area, q, page));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(vacanteService.cambiarEstado(id, body.get("estado")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            vacanteService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}