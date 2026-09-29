package com.talvia.talvia.services.auth;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.talvia.talvia.dto.request.auth.RegisterEmpresaDTO;
import com.talvia.talvia.dto.request.auth.RegisterTrabajadorDTO;

public interface RegisterService {
    void registerTrabajador(RegisterTrabajadorDTO dto, Map<String, MultipartFile> archivos);
    void registerEmpresa(RegisterEmpresaDTO dto);
}