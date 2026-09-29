package com.talvia.talvia.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class AdminPostulacionDTO {
    private Long id;
    private String trabajadorNombre;
    private String vacanteTitulo;
    private String empresaNombre;
    private String fecha;
    private String fechaVista; //null si la empresa no abre la postulacion todavia
    private String estado;
}
