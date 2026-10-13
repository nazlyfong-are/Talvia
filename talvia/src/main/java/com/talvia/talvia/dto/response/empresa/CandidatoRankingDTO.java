package com.talvia.talvia.dto.response.empresa;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class CandidatoRankingDTO {
    private int posicion;
    private Long postulacionId;
    private String nombre;
    private String ciudad;
    private Double anosExperiencia;
    private String fecha;          // fecha de la postulación
    private String estado;
    private boolean vista;         // la empresa ya abrió su hoja de vida
    private int puntaje;           // 0 a 100
    private String nivel;          // ALTA, MEDIA o BAJA
    private List<FactorDTO> factores;
}
