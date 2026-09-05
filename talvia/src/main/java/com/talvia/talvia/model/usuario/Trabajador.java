package com.talvia.talvia.model.usuario;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


import com.talvia.talvia.model.embedded.Certificacion;
import com.talvia.talvia.model.embedded.ExpLaboral;
import com.talvia.talvia.model.embedded.Formacion;
import com.talvia.talvia.model.embedded.Habilidad;
import com.talvia.talvia.model.embedded.ImagenCloudinary;
import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.enums.Rol;
import com.talvia.talvia.model.enums.TipoDocumento;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "trabajadores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Trabajador extends Usuario {

    private String especilidad;

    private String primerApellido;
    private String segundoApellido;

    @Enumerated(EnumType.STRING)
    private TipoDocumento tipoDocumento;

    @Column(unique = true)
    private String numeroDocumento; 
    
    @Column(length = 2000)
    private String resumenProfesional;

    private Integer aniosExpTotal;

    private String ciudad;
    
    private boolean disponibleInmediato;
    
    private String cvArchivoUrl;

    @Embedded
    private ImagenCloudinary foto;

    @Embedded
    private RangoSalarial pretensionSalarial;
    
    //Lista con identidad propia -> entidades independientes (uno a muchos)
    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpLaboral> experiencias = new ArrayList<>();
    
    //Lista de valores simples
    @ElementCollection
    @CollectionTable(name = "trabajador_habilidades", joinColumns = @JoinColumn(name = "trabajador_id"))
    private List<Habilidad> habilidades = new ArrayList<>();
    
    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Formacion> formaciones = new ArrayList<>();
    
    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certificacion> certificaciones = new ArrayList<>();
}
