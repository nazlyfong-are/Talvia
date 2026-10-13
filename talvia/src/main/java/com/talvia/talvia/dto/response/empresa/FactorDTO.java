package com.talvia.talvia.dto.response.empresa;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class FactorDTO {
    private String texto;
    private String efecto; //POSITIVO, NEGATIVO O NEUTRO
}
