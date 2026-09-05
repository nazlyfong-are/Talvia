package com.talvia.talvia.services;

import com.talvia.talvia.dto.RegisterEmpresaDTO;
import com.talvia.talvia.dto.RegisterTrabajadorDTO;

public interface RegisterService {
    void registerTrabajador(RegisterTrabajadorDTO dto);
    void registerEmpresa(RegisterEmpresaDTO dto);
}