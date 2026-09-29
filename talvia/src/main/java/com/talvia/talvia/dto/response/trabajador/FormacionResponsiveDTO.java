package com.talvia.talvia.dto.response.trabajador;

public class FormacionResponsiveDTO {

    private Long id;
    private String instituto;
    private String titulo;
    private String nivel;
    private String fechaInicio;
    private String fechaFin;
    private boolean enCurso;
    private String documentoUrl;

    public FormacionResponsiveDTO() {}
    public FormacionResponsiveDTO(Long id, String instituto, String titulo, String nivel, String fechaInicio,
            String fechaFin, boolean enCurso, String documentoUrl) {
        this.id = id;
        this.instituto = instituto;
        this.titulo = titulo;
        this.nivel = nivel;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.enCurso = enCurso;
        this.documentoUrl = documentoUrl;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getInstituto() {
        return instituto;
    }
    public void setInstituto(String instituto) {
        this.instituto = instituto;
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
    public String getDocumentoUrl() {
        return documentoUrl;
    }
    public void setDocumentoUrl(String documentoUrl) {
        this.documentoUrl = documentoUrl;
    }
}
