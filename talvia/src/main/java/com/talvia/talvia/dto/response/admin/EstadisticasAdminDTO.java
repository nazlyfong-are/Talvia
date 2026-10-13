package com.talvia.talvia.dto.response.admin;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class EstadisticasAdminDTO {

    private long totalTrabajadores;
    private long totalEmpresas;
    private long vacantesAbiertas;
    private long vacantesPausadas;
    private long totalPostulaciones;
    private long aceptadas;
    private long rechazadas;
    private List<RegistroSemana> registroPorSemana;

    @Getter 
    @Setter 
    @NoArgsConstructor 
    @AllArgsConstructor 
    public static class RegistroSemana {
        private String etiqueta;
        private long total;
    }
}
