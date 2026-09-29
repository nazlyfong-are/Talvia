package com.talvia.talvia.model.proceso;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.Id;

import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.enums.EstadoSolicitud;
import com.talvia.talvia.model.usuario.Empresa;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "solicitudes_compatibilidad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudCompatibilidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresaSolicitante;

    private String especialidadBuscada;
    
    @ElementCollection
    @CollectionTable(name = "solicitud_habilidades_requeridas", joinColumns = @JoinColumn(name = "solicitud_id"))
    @Column(name = "habilidad")
    private List<String> habilidadesRequeridas;

    @Embedded
    private RangoSalarial presupuestoDisponible;

    private Integer experienciaMinima;

    private LocalDateTime fechaSolicitud;

    @ElementCollection
    @CollectionTable(name = "solicitud_trabajadores_sugeridos", joinColumns = @JoinColumn(name = "solicitud_id"))
    @Column(name = "trabajador_id")
    private List<String> trabajadorIdsSugeridos;
    
    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado;
}
