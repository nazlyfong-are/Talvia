package com.talvia.talvia.controller;

import com.talvia.talvia.dto.RegisterEmpresaDTO;
import com.talvia.talvia.dto.RegisterTrabajadorDTO;
import com.talvia.talvia.services.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/register")
public class RegisterController {

    @Autowired
    private RegisterService registerService;

    @PostMapping("/trabajador")
    public ResponseEntity<?> registerTrabajador(@RequestBody RegisterTrabajadorDTO dto) {
        try {
            registerService.registerTrabajador(dto);
            return ResponseEntity.ok("Cuenta creada exitosamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @PostMapping("/empresa")
    public ResponseEntity<?> registerEmpresa(@RequestBody RegisterEmpresaDTO dto) {
        try {
            registerService.registerEmpresa(dto);
            return ResponseEntity.ok("Cuenta empresarial creada exitosamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }
}