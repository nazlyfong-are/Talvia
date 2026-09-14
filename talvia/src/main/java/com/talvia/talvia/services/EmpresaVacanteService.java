package com.talvia.talvia.services;

import java.util.List;

import com.talvia.talvia.dto.request.VacanteCreateDTO;
import com.talvia.talvia.dto.response.VacantesResponseDTO;

public interface EmpresaVacanteService {
    List<VacantesResponseDTO> listarPropias(Long empresaId);
    VacantesResponseDTO crear(Long empresaId, VacanteCreateDTO dto);
    void eliminar(Long empresaId, Long vacanteId);
}
