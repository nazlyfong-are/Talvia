package com.talvia.talvia.controller.publico;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.dto.response.EmpresaResponseDTO;
import com.talvia.talvia.services.empresa.EmpresaService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/empresas")
public class EmpresaPublicController {

    @Autowired private EmpresaService empresaService;

    @GetMapping
    public List<EmpresaResponseDTO> list() {
        return empresaService.listarEmpresas();
    }
    
@GetMapping("/{id}")
public ResponseEntity<?> obtenerPublica(@PathVariable Long id) {
    try {
        return ResponseEntity.ok(empresaService.obtenerPublica(id));
    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
}
}
