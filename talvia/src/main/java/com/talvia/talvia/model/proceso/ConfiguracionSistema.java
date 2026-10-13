package com.talvia.talvia.model.proceso;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name = "configuracion_sistema")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class ConfiguracionSistema {

    @Id
    private Long id = 1L; //fila unica siempre id = 1

    private int diasVacanteSinCandidatos = 15;
    private boolean verificacionCorreoObligatoria = true;
}
