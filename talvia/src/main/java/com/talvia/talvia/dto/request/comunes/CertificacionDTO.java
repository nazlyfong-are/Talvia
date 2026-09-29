package com.talvia.talvia.dto.request.comunes;

public class CertificacionDTO {

    private String nombre;
    private String entidadEmisora;
    private String fechaObtencion;
    private String fechaVencimiento;
    
    public CertificacionDTO() {
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
    public String getFechaObtencion() {
        return fechaObtencion;
    }
    public void setFechaObtencion(String fechaObtencion) {
        this.fechaObtencion = fechaObtencion;
    }
    public String getFechaVencimiento() {
        return fechaVencimiento;
    }
    public void setFechaVencimiento(String fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }
}
