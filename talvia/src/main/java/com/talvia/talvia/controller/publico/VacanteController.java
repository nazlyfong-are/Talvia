package com.talvia.talvia.controller.publico;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.dto.response.vacante.VacantesResponseDTO;
import com.talvia.talvia.services.vacante.VacanteService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/vacantes")
public class VacanteController {

    @Autowired private VacanteService vacanteService;

    @GetMapping("/activas")
    public List<VacantesResponseDTO> listarActivas() {
        return vacanteService.listarActivas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(vacanteService.obtenerPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/empresa/{empresaId}")
public ResponseEntity<?> listarPorEmpresa(@PathVariable Long empresaId) {
    return ResponseEntity.ok(vacanteService.listarActivasPorEmpresa(empresaId));
}
}
