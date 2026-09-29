package com.talvia.talvia.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.talvia.talvia.services.admin.AdminUsuarioService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUsuarioController {

    @Autowired
    private AdminUsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String activo,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page) {
        try {
            return ResponseEntity.ok(usuarioService.listar(rol, activo, q, page));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.obtener(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean activo = body.get("activo");
        if (activo == null) {
            return ResponseEntity.badRequest().body("Falta el campo 'activo'.");
        }
        try {
            return ResponseEntity.ok(usuarioService.cambiarEstado(id, activo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}