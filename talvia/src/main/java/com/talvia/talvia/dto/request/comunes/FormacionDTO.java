package com.talvia.talvia.dto.request.comunes;

public class FormacionDTO {

    private String institucion;
    private String titulo;
    private String nivel;
    private String fechaInicio;
    private String fechaFin;
    private boolean enCurso;

    public FormacionDTO() {
    }
    public String getInstitucion() {
        return institucion;
    }
    public void setInstitucion(String institucion) {
        this.institucion = institucion;
    }
    public String getTitulo() {
        return titulo;
    }
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    public String getNivel() {
        return nivel;
    }
    public void setNivel(String nivel) {
        this.nivel = nivel;
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
    public boolean isEnCurso() {
        return enCurso;
    }
    public void setEnCurso(boolean enCurso) {
        this.enCurso = enCurso;
    }
}
