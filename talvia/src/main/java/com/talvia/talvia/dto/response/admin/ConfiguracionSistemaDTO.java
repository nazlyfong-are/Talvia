package com.talvia.talvia.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class ConfiguracionSistemaDTO {
    private int diasVacanteSinCandidatos;
    private boolean verificacionCorreoObligatoria;
}
