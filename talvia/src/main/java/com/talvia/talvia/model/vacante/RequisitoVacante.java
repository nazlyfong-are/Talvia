package com.talvia.talvia.model.vacante;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitoVacante {
    private String descripcion;
    private boolean obligatorio;
}
