package com.talvia.talvia.dto.request.trabajador;

public class FormacionUpdateDTO {

    private Long id;
    private String institucion;
    private String titulo;
    private String nivel;
    private String fechaInicio;
    private String fechaFin;
    private boolean enCurso;
    
    public FormacionUpdateDTO() {}
    public FormacionUpdateDTO(Long id, String institucion, String titulo, String nivel, String fechaInicio,
            String fechaFin, boolean enCurso) {
        this.id = id;
        this.institucion = institucion;
        this.titulo = titulo;
        this.nivel = nivel;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.enCurso = enCurso;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
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
