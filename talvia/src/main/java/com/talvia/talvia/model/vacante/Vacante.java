package com.talvia.talvia.model.vacante;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.Id;
import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.enums.NivelEducativo;
import com.talvia.talvia.model.usuario.Empresa;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vacantes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vacante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    private String titulo;
    private String area;
    private String nivelCargo;
    
    @Column(length = 3000)
    private String descripcion; 

    @Embedded
    private RangoSalarial presupuesto;
    
    @ElementCollection
    @CollectionTable(name = "vacante_requisitos", joinColumns = @JoinColumn(name = "vacante_id"))
    private List<RequisitoVacante> requisitos = new ArrayList<>();
    
    private Integer expMinimaAnios;
    
    @Enumerated(EnumType.STRING)
    private NivelEducativo nivelEducativoMinimo;
    
    @Enumerated(EnumType.STRING)
    private EstadoVacante estado;
    
    private LocalDateTime fechaPublicacion;
    
    private String modalidad;

    private String ubicacion;

    @Column(length = 2000)
    private String beneficios;
}
