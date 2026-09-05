package com.talvia.talvia.model.embedded;

import com.talvia.talvia.model.enums.NivelHabilidad;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Habilidad {

    private String nombre;

    @Enumerated(EnumType.STRING)
    private NivelHabilidad nivel;
    private String categoria;
}
