package com.talvia.talvia.model.embedded;

import java.time.LocalDate;

import com.talvia.talvia.model.usuario.Trabajador;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "experiencias_laborales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String empresaNombre;
    private String cargo;
    private LocalDate fechaInicio;
    private LocalDate fechaFin; //nulo si es actual
    
    @Column(length = 2000)
    private String descripcion;

    private boolean trabajoActual;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;
}
