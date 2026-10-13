package com.talvia.talvia.model.embedded;

import java.time.LocalDateTime;

import com.talvia.talvia.model.usuario.Trabajador;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cv_documentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CvDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String url;
    private String publicId;
    private LocalDateTime fechaSubida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;
}
