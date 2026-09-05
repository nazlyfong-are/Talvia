package com.talvia.talvia.model.proceso;

import java.time.LocalDateTime;

import org.hibernate.annotations.GeneratedColumn;

import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.vacante.Vacante;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "psotulaciones", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trabajador_id", "vacantes_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Postulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacante_id", nullable = false)
    private Vacante vacante;

    private LocalDateTime fechaPostulacion; 

    private String estado;
}
