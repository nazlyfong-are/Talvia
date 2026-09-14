package com.talvia.talvia.services;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.talvia.talvia.dto.request.TrabajadorPerfilUpdateDTO;
import com.talvia.talvia.dto.response.CvDocumentoResponseDTO;
import com.talvia.talvia.dto.response.TrabajadorPerfilResponseDTO;

public interface TrabajadorService {
    TrabajadorPerfilResponseDTO obtenerPerfil(Long trabajadorId);
    TrabajadorPerfilResponseDTO actualizarPerfil(Long trabajadorId, TrabajadorPerfilUpdateDTO dto);
    String actualizarFoto(Long trabajadorId, MultipartFile archivo) throws Exception;

    List<CvDocumentoResponseDTO> listarCvs(Long trabajadorId);
    CvDocumentoResponseDTO subirCv(Long trabajadorId, String nombre, MultipartFile archivo) throws Exception;
    void eliminarCv(Long trabajadorId, Long cvId) throws Exception;

    String adjuntarDocumentoFormacion(Long trabajadorId, Long formacionId, MultipartFile archivo) throws Exception;
    void eliminarDocumentoFormacion(Long trabajadorId, Long formacionId) throws Exception;
    String adjuntarDocumentoCertificacion(Long trabajadorId, Long certificacionId, MultipartFile archivo) throws Exception;
}
