package com.talvia.talvia.services;

import java.util.List;

import com.talvia.talvia.dto.request.EmpresaPerfilUpdateDTO;
import com.talvia.talvia.dto.response.EmpresaPerfilResponseDTO;
import com.talvia.talvia.dto.response.EmpresaResponseDTO;

public interface EmpresaService {
    List<EmpresaResponseDTO> listarEmpresas();
    EmpresaPerfilResponseDTO obtenerPerfil(Long empresaId);
EmpresaPerfilResponseDTO actualizarPerfil(Long empresaId, EmpresaPerfilUpdateDTO dto);
String actualizarLogo(Long empresaId, org.springframework.web.multipart.MultipartFile archivo) throws Exception;
}
