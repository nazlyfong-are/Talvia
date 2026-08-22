package com.talvia.talvia.services;

import com.talvia.talvia.dto.RegisterEmpresaDTO;
import com.talvia.talvia.dto.RegisterNaturalDTO;

public interface RegisterService {

    void registerNatural(RegisterNaturalDTO dto);

    void registerEmpresa(RegisterEmpresaDTO dto);
}