package com.talvia.talvia.model.embedded;

import java.time.LocalDate;

public class ExpLaboral {

    private String empresaNombre;
    private String cargo;
    private LocalDate fechaInicio;
    private LocalDate fechaFin; //nulo si es actual
    private String descripcion;
    private boolean trabajoActual;
    
    public ExpLaboral() {
    }
    public ExpLaboral(String empresaNombre, String cargo, LocalDate fechaInicio, LocalDate fechaFin, String descripcion,
            boolean trabajoActual) {
        this.empresaNombre = empresaNombre;
        this.cargo = cargo;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.descripcion = descripcion;
        this.trabajoActual = trabajoActual;
    }
    public String getEmpresaNombre() {
        return empresaNombre;
    }
    public void setEmpresaNombre(String empresaNombre) {
        this.empresaNombre = empresaNombre;
    }
    public String getCargo() {
        return cargo;
    }
    public void setCargo(String cargo) {
        this.cargo = cargo;
    }
    public LocalDate getFechaInicio() {
        return fechaInicio;
    }
    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    public LocalDate getFechaFin() {
        return fechaFin;
    }
    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public boolean isTrabajoActual() {
        return trabajoActual;
    }
    public void setTrabajoActual(boolean trabajoActual) {
        this.trabajoActual = trabajoActual;
    }
}
