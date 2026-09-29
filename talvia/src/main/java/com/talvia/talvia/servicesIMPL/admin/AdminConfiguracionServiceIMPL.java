package com.talvia.talvia.servicesIMPL.admin;

import com.talvia.talvia.dto.response.admin.ConfiguracionSistemaDTO;
import com.talvia.talvia.model.proceso.ConfiguracionSistema;
import com.talvia.talvia.repository.sistema.ConfiguracionSistemaRepository;
import com.talvia.talvia.services.admin.AdminConfiguracionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminConfiguracionServiceIMPL implements AdminConfiguracionService {

    private static final Long ID_UNICO = 1L;

    @Autowired private ConfiguracionSistemaRepository configRepository;

    @Override
    @Transactional
    public ConfiguracionSistemaDTO obtener() {
        ConfiguracionSistema config = obtenerOCrear();
        return toDTO(config);
    }

    @Override
    @Transactional
    public ConfiguracionSistemaDTO actualizar(ConfiguracionSistemaDTO dto) {
        if (dto.getDiasVacanteSinCandidatos() < 1 || dto.getDiasVacanteSinCandidatos() > 90) {
            throw new IllegalArgumentException("Los días deben estar entre 1 y 90.");
        }

        ConfiguracionSistema config = obtenerOCrear();
        config.setDiasVacanteSinCandidatos(dto.getDiasVacanteSinCandidatos());
        config.setVerificacionCorreoObligatoria(dto.isVerificacionCorreoObligatoria());

        return toDTO(configRepository.save(config));
    }

    /** La fila con id=1 se crea sola la primera vez que alguien pide o guarda la configuración. */
    private ConfiguracionSistema obtenerOCrear() {
        return configRepository.findById(ID_UNICO)
                .orElseGet(() -> configRepository.save(new ConfiguracionSistema()));
    }

    private ConfiguracionSistemaDTO toDTO(ConfiguracionSistema config) {
        return new ConfiguracionSistemaDTO(
                config.getDiasVacanteSinCandidatos(),
                config.isVerificacionCorreoObligatoria()
        );
    }
}