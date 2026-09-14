package com.talvia.talvia.model.usuario;

import java.util.List;

import com.talvia.talvia.model.embedded.ImagenCloudinary;
import com.talvia.talvia.model.vacante.Vacante;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "empresas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Empresa extends Usuario{

    private String razonSocial;
    private String figuraLegal;

    @Column(unique = true)
    private String nit;

    private String sector;
    
    @Column(length = 2000)
    private String descripcion;

    private String direccion;
    private String ciudad;
    private String sitioWeb;
    private String numeroEmpleados;

    @Embedded
    private ImagenCloudinary logo;

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vacante> vacantesPublicadas;
}
