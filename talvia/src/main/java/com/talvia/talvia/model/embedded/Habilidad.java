package com.talvia.talvia.model.embedded;

import com.talvia.talvia.model.enums.NivelHabilidad;

public class Habilidad {

    private String nombre;
    private NivelHabilidad nivel;
    private String categoria;

    public Habilidad() {
    }
    public Habilidad(String nombre, NivelHabilidad nivel, String categoria) {
        this.nombre = nombre;
        this.nivel = nivel;
        this.categoria = categoria;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public NivelHabilidad getNivel() {
        return nivel;
    }
    public void setNivel(NivelHabilidad nivel) {
        this.nivel = nivel;
    }
    public String getCategoria() {
        return categoria;
    }
    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
}
