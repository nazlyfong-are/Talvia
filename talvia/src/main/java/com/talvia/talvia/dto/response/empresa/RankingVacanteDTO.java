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
public class RankingVacanteDTO {
    private Long vacanteId;
    private String titulo;
    private String origen;         // REGLAS (provisional) o MODELO
    private String version;
    private String generadoEn;
    private int total;
    private List<CandidatoRankingDTO> candidatos;
}
