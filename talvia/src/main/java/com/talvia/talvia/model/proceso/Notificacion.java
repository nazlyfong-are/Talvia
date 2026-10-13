package com.talvia.talvia.model.proceso;

import java.time.LocalDateTime;

import com.talvia.talvia.model.enums.TipoNotificacion;
import com.talvia.talvia.model.usuario.Usuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name = "notificaciones")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; //a quien le pertenece (empresa o trabajador)

    @Enumerated(EnumType.STRING)
    private TipoNotificacion tipo;

    private String mensaje;
    private String urlDestino;

    private LocalDateTime fechaCreacion;
    private boolean leida;
}
