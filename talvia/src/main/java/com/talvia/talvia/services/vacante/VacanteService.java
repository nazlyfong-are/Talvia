package com.talvia.talvia.services.vacante;

import java.util.List;

import com.talvia.talvia.dto.response.vacante.VacantesResponseDTO;
import com.talvia.talvia.model.vacante.Vacante;

public interface VacanteService {
    List<VacantesResponseDTO> listarActivas();
    VacantesResponseDTO obtenerPorId(Long id);
    VacantesResponseDTO toDTO(Vacante vacante);
    List<VacantesResponseDTO> listarActivasPorEmpresa(Long empresaId);
}
