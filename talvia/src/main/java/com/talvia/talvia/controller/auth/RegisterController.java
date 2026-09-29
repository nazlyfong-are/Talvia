package com.talvia.talvia.controller.auth;

import com.talvia.talvia.dto.request.auth.RegisterEmpresaDTO;
import com.talvia.talvia.dto.request.auth.RegisterTrabajadorDTO;
import com.talvia.talvia.services.auth.RegisterService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/register")
public class RegisterController {

    @Autowired
    private RegisterService registerService;

    @PostMapping(value = "/trabajador", consumes = "multipart/form-data")
    public ResponseEntity<?> registerTrabajador(@RequestPart("datos") RegisterTrabajadorDTO dto,
                                                 HttpServletRequest request) {
        try {
            Map<String, org.springframework.web.multipart.MultipartFile> archivos = new HashMap<>();
            if (request instanceof MultipartHttpServletRequest multipartRequest) {
                archivos = multipartRequest.getFileMap();
            }
            registerService.registerTrabajador(dto, archivos);
            return ResponseEntity.ok("Cuenta creada exitosamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al registrar la cuenta: " + e.getMessage());
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