package com.talvia.talvia.services.empresa;

import java.util.List;

import com.talvia.talvia.dto.request.empresa.EmpresaPerfilUpdateDTO;
import com.talvia.talvia.dto.response.EmpresaResponseDTO;
import com.talvia.talvia.dto.response.empresa.EmpresaPerfilResponseDTO;
import com.talvia.talvia.dto.response.empresa.EmpresaPublicaDTO;

public interface EmpresaService {
    List<EmpresaResponseDTO> listarEmpresas();
    EmpresaPerfilResponseDTO obtenerPerfil(Long empresaId);
EmpresaPerfilResponseDTO actualizarPerfil(Long empresaId, EmpresaPerfilUpdateDTO dto);
String actualizarLogo(Long empresaId, org.springframework.web.multipart.MultipartFile archivo) throws Exception;
EmpresaPublicaDTO obtenerPublica(Long empresaId);

}
