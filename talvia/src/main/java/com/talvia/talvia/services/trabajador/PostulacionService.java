package com.talvia.talvia.services.trabajador;

import java.util.List;

import com.talvia.talvia.dto.request.trabajador.PostulacionCreateDTO;
import com.talvia.talvia.dto.response.empresa.PostulacionDetalleDTO;
import com.talvia.talvia.dto.response.empresa.PostulacionResponseDTO;
import com.talvia.talvia.dto.response.trabajador.PostulacionTrabajadorResponseDTO;

public interface PostulacionService {
    void postularse(Long trabajadorId, PostulacionCreateDTO dto);
    List<PostulacionResponseDTO> listarPorEmpresa(Long empresaId);
    PostulacionDetalleDTO obtenerDetalle(Long empresaId, Long postulacionId);
    void actualizarEstado(Long empresaId, Long postulacionId, String nuevoEstado);
    boolean yaPostulo(Long trabajadorId, Long vacanteId);
    List<PostulacionTrabajadorResponseDTO> listarPorTrabajador(Long trabajadorId);
}
