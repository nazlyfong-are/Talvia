package com.talvia.talvia.model.proceso;

import java.time.LocalDateTime;

import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.vacante.Vacante;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name = "vacantes_favoritas", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trabajador_id", "vacante_id"})
})
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class VacanteFavorita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacante_id", nullable = false)
    private Vacante vacante;

    private LocalDateTime fechaGuardado;
}
