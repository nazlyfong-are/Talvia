package com.talvia.talvia.model.proceso;

import java.time.LocalDateTime;

import com.talvia.talvia.model.enums.EstadoPostulacion;
import com.talvia.talvia.model.embedded.CvDocumento;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.vacante.Vacante;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "postulaciones", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trabajador_id", "vacante_id"})
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_documento_id", nullable = false)
    private CvDocumento cvEnviado;

    private LocalDateTime fechaPostulacion;

    @Enumerated(EnumType.STRING)
    private EstadoPostulacion estado;

    private String salarioEsperado;
    private String disponibilidad;
    private LocalDateTime fechaVista;

    @Column(length = 2000)
    private String experienciaResumen;
}