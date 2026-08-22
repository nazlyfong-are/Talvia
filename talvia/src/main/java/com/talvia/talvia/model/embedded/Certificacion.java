package com.talvia.talvia.model.embedded;

import java.time.LocalDate;

public class Certificacion {

    private String nombre;
    private String entidadEmisora;
    private LocalDate fechaObtencion;
    private LocalDate fechaVencimiento;
    
    public Certificacion() {
    }
    public Certificacion(String nombre, String entidadEmisora, LocalDate fechaObtencion, LocalDate fechaVencimiento) {
        this.nombre = nombre;
        this.entidadEmisora = entidadEmisora;
        this.fechaObtencion = fechaObtencion;
        this.fechaVencimiento = fechaVencimiento;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getEntidadEmisora() {
        return entidadEmisora;
    }
    public void setEntidadEmisora(String entidadEmisora) {
        this.entidadEmisora = entidadEmisora;
    }
    public LocalDate getFechaObtencion() {
        return fechaObtencion;
    }
    public void setFechaObtencion(LocalDate fechaObtencion) {
        this.fechaObtencion = fechaObtencion;
    }
    public LocalDate getFechaVencimiento() {
        return fechaVencimiento;
    }
    public void setFechaVencimiento(LocalDate fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }
}
