package com.talvia.talvia.model.embedded;

import java.time.LocalDate;

import com.talvia.talvia.model.usuario.Trabajador;

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
@Table(name = "certificaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Certificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String entidadEmisora;
    private LocalDate fechaObtencion;
    private LocalDate fechaVencimiento; //opcional

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;
}
