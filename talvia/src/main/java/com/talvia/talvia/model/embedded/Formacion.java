package com.talvia.talvia.model.embedded;

import java.time.LocalDate;

import com.talvia.talvia.model.enums.NivelEducativo;

public class Formacion {

    private String instituto;
    private String titulo;
    private NivelEducativo nivel;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private boolean enCurso;
    
    public Formacion() {
    }
    public Formacion(String instituto, String titulo, NivelEducativo nivel, LocalDate fechaInicio, LocalDate fechaFin,
            boolean enCurso) {
        this.instituto = instituto;
        this.titulo = titulo;
        this.nivel = nivel;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.enCurso = enCurso;
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
    public NivelEducativo getNivel() {
        return nivel;
    }
    public void setNivel(NivelEducativo nivel) {
        this.nivel = nivel;
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
    public boolean isEnCurso() {
        return enCurso;
    }
    public void setEnCurso(boolean enCurso) {
        this.enCurso = enCurso;
    }
}
