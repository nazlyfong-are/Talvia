package com.talvia.talvia.dto.request.trabajador;

public class CertificacionUpdateDTO {
    private Long id;
    private String nombre;
    private String entidadEmisora;
    private String fechaObtencion;
    private String fechaVencimiento;

    public CertificacionUpdateDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEntidadEmisora() { return entidadEmisora; }
    public void setEntidadEmisora(String entidadEmisora) { this.entidadEmisora = entidadEmisora; }
    public String getFechaObtencion() { return fechaObtencion; }
    public void setFechaObtencion(String fechaObtencion) { this.fechaObtencion = fechaObtencion; }
    public String getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(String fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
}