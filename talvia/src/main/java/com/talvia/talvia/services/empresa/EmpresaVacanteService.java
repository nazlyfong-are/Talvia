package com.talvia.talvia.services.empresa;

import java.util.List;

import com.talvia.talvia.dto.request.empresa.VacanteCreateDTO;
import com.talvia.talvia.dto.response.empresa.VacanteDetalleEdicionDTO;
import com.talvia.talvia.dto.response.vacante.VacantesResponseDTO;

public interface EmpresaVacanteService {
    List<VacantesResponseDTO> listarPropias(Long empresaId);
    VacantesResponseDTO crear(Long empresaId, VacanteCreateDTO dto);
    void eliminar(Long empresaId, Long vacanteId);

    VacanteDetalleEdicionDTO obtenerPropiaParaEditar(Long empresaId, Long vacanteId);
    VacantesResponseDTO actualizar(Long empresaId, Long vacanteId, VacanteCreateDTO dto);
    VacantesResponseDTO cambiarEstado(Long empresaId, Long vacanteId, String nuevoEstado);
}
