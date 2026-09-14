package com.talvia.talvia.controller;

import com.talvia.talvia.dto.request.EmpresaPerfilUpdateDTO;
import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/empresa/perfil")
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    @GetMapping
    public ResponseEntity<?> obtener(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(empresaService.obtenerPerfil(principal.getId()));
    }

    @PutMapping
    public ResponseEntity<?> actualizar(@AuthenticationPrincipal UserPrincipal principal,
                                         @RequestBody EmpresaPerfilUpdateDTO dto) {
        return ResponseEntity.ok(empresaService.actualizarPerfil(principal.getId(), dto));
    }

    @PostMapping(value = "/logo", consumes = "multipart/form-data")
    public ResponseEntity<?> subirLogo(@AuthenticationPrincipal UserPrincipal principal,
                                        @RequestParam("archivo") MultipartFile archivo) {
        try {
            String url = empresaService.actualizarLogo(principal.getId(), archivo);
            return ResponseEntity.ok(Map.of("logoUrl", url));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al subir el logo: " + e.getMessage());
        }
    }
}