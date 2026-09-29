package com.talvia.talvia.model.usuario;

import java.time.LocalDateTime;
import jakarta.persistence.Id;
import com.talvia.talvia.model.enums.Rol;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Inheritance(strategy =  InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String contrasena;

    private String Telefono;
    
    private LocalDateTime fechaRegistro;
    
    private boolean activo = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;
}
