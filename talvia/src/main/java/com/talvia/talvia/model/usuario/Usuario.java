package com.talvia.talvia.model.usuario;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;

import com.talvia.talvia.model.enums.Rol;

public class Usuario {

    @Id
    private String id;
    private String nombre;
    private String email;
    private String contrasena;
    private String tlefono;
    private LocalDateTime fechaRegistro;
    private boolean activo;
    private Rol rol;
    
    public Usuario() {
    }
    public Usuario(String id, String nombre, String email, String contrasena, String tlefono,
            LocalDateTime fechaRegistro, boolean activo, Rol rol) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.contrasena = contrasena;
        this.tlefono = tlefono;
        this.fechaRegistro = fechaRegistro;
        this.activo = activo;
        this.rol = rol;
    }
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getContrasena() {
        return contrasena;
    }
    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
    public String getTlefono() {
        return tlefono;
    }
    public void setTlefono(String tlefono) {
        this.tlefono = tlefono;
    }
    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
    public boolean isActivo() {
        return activo;
    }
    public void setActivo(boolean activo) {
        this.activo = activo;
    }
    public Rol getRol() {
        return rol;
    }
    public void setRol(Rol rol) {
        this.rol = rol;
    }
}
