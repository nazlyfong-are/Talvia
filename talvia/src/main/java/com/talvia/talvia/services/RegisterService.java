package com.talvia.talvia.services;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.talvia.talvia.dto.request.RegisterEmpresaDTO;
import com.talvia.talvia.dto.request.RegisterTrabajadorDTO;

public interface RegisterService {
    void registerTrabajador(RegisterTrabajadorDTO dto, Map<String, MultipartFile> archivos);
    void registerEmpresa(RegisterEmpresaDTO dto);
}