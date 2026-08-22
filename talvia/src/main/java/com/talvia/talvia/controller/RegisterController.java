package com.talvia.talvia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.dto.RegisterEmpresaDTO;
import com.talvia.talvia.dto.RegisterNaturalDTO;
import com.talvia.talvia.services.RegisterService;

@RestController
@RequestMapping("/api/register")
public class RegisterController {

    @Autowired
    private RegisterService registerService;

    @PostMapping("/natural")
    public ResponseEntity<?> registerNatural(@RequestBody RegisterNaturalDTO dto) {
        try {
            registerService.registerNatural(dto);
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