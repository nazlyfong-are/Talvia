package com.talvia.talvia.services;

import java.util.List;

import com.talvia.talvia.dto.response.VacantesResponseDTO;
import com.talvia.talvia.model.vacante.Vacante;

public interface VacanteService {
    List<VacantesResponseDTO> listarActivas();
    VacantesResponseDTO obtenerPorId(Long id);
    VacantesResponseDTO toDTO(Vacante vacante);
}
