package com.talvia.talvia.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class AdminVacanteDTO {
    private Long id;
    private String titulo;
    private String empresa;
    private String area;
    private String fecha;
    private long totalPostulaciones;
    private String estado;
}
