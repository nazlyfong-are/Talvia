package com.talvia.talvia.services.admin;

import com.talvia.talvia.dto.response.admin.ConfiguracionSistemaDTO;

public interface AdminConfiguracionService {
    ConfiguracionSistemaDTO obtener();
    ConfiguracionSistemaDTO actualizar(ConfiguracionSistemaDTO dto);
}
