package com.talvia.talvia.dto.response.trabajador;

public class ExperienciaResponseDTO {

    private Long id;
    private String empresaNombre;
    private String cargo;
    private String fechaInicio;
    private String fechaFin;
    private String descripcion;
    private boolean trabajoActual;

    public ExperienciaResponseDTO() {}
    public ExperienciaResponseDTO(Long id, String empresaNombre, String cargo, String fechaInicio, String fechaFin,
            String descripcion, boolean trabajoActual) {
        this.id = id;
        this.empresaNombre = empresaNombre;
        this.cargo = cargo;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.descripcion = descripcion;
        this.trabajoActual = trabajoActual;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
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
    public String getFechaInicio() {
        return fechaInicio;
    }
    public void setFechaInicio(String fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    public String getFechaFin() {
        return fechaFin;
    }
    public void setFechaFin(String fechaFin) {
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
