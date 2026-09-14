package com.talvia.talvia.services;

import java.util.List;

import com.talvia.talvia.dto.request.PostulacionCreateDTO;
import com.talvia.talvia.dto.response.PostulacionDetalleDTO;
import com.talvia.talvia.dto.response.PostulacionResponseDTO;
import com.talvia.talvia.dto.response.PostulacionTrabajadorResponseDTO;

public interface PostulacionService {
    void postularse(Long trabajadorId, PostulacionCreateDTO dto);
    List<PostulacionResponseDTO> listarPorEmpresa(Long empresaId);
    PostulacionDetalleDTO obtenerDetalle(Long empresaId, Long postulacionId);
    void actualizarEstado(Long empresaId, Long postulacionId, String nuevoEstado);
    boolean yaPostulo(Long trabajadorId, Long vacanteId);
    List<PostulacionTrabajadorResponseDTO> listarPorTrabajador(Long trabajadorId);
}
