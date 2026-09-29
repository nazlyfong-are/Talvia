package com.talvia.talvia.services.trabajador;

import java.util.List;

import com.talvia.talvia.dto.response.trabajador.VacanteFavoritaResponseDTO;

public interface VacanteFavoritaService {
    void agregar(Long trabajadorId,Long vacanteId);
    void quitar(Long trabajadorId, Long vacanteId);
    boolean esFavorita(Long trabajadorId, Long vacanteId);
    List<VacanteFavoritaResponseDTO> listar(Long trabajadorId);

}
