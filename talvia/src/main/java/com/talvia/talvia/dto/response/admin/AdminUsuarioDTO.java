package com.talvia.talvia.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class AdminUsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private String rol;
    private String ciudad;
    private String telefono;
    private String fechaRegistro;
    private boolean activo;
}
