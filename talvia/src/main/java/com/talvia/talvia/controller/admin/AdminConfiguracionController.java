package com.talvia.talvia.controller.admin;

import com.talvia.talvia.dto.response.admin.ConfiguracionSistemaDTO;
import com.talvia.talvia.services.admin.AdminConfiguracionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/configuracion")
public class AdminConfiguracionController {

    @Autowired private AdminConfiguracionService configuracionService;

    @GetMapping
    public ResponseEntity<?> obtener() {
        return ResponseEntity.ok(configuracionService.obtener());
    }

    @PutMapping
    public ResponseEntity<?> actualizar(@RequestBody ConfiguracionSistemaDTO dto) {
        try {
            return ResponseEntity.ok(configuracionService.actualizar(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}