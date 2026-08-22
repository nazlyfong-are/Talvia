package com.talvia.talvia.model.vacante;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.enums.NivelEducativo;
import com.talvia.talvia.model.usuario.Empresa;

public class Vacante {

    @Id
    private String id;
    @DBRef
    private Empresa empresa;
    private String titulo;
    private String especialidadRequeridad;
    private String RangoSalarial;
    private String descripcion; 
    private RangoSalarial presupuesto;
    private List<RequisitoVacante> requisitos = new ArrayList<>();
    private Integer expMinimaAnios;
    private NivelEducativo nivelEducativoMinimo;
    private EstadoVacante estado;
    private LocalDateTime fechaPublicacion;
    private String modalidad;
    
    public Vacante() {
    }
    public Vacante(String id, Empresa empresa, String titulo, String especialidadRequeridad, String rangoSalarial,
            String descripcion, com.talvia.talvia.model.embedded.RangoSalarial presupuesto,
            List<RequisitoVacante> requisitos, Integer expMinimaAnios, NivelEducativo nivelEducativoMinimo,
            EstadoVacante estado, LocalDateTime fechaPublicacion, String modalidad) {
        this.id = id;
        this.empresa = empresa;
        this.titulo = titulo;
        this.especialidadRequeridad = especialidadRequeridad;
        RangoSalarial = rangoSalarial;
        this.descripcion = descripcion;
        this.presupuesto = presupuesto;
        this.requisitos = requisitos;
        this.expMinimaAnios = expMinimaAnios;
        this.nivelEducativoMinimo = nivelEducativoMinimo;
        this.estado = estado;
        this.fechaPublicacion = fechaPublicacion;
        this.modalidad = modalidad;
    }
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public Empresa getEmpresa() {
        return empresa;
    }
    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }
    public String getTitulo() {
        return titulo;
    }
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    public String getEspecialidadRequeridad() {
        return especialidadRequeridad;
    }
    public void setEspecialidadRequeridad(String especialidadRequeridad) {
        this.especialidadRequeridad = especialidadRequeridad;
    }
    public String getRangoSalarial() {
        return RangoSalarial;
    }
    public void setRangoSalarial(String rangoSalarial) {
        RangoSalarial = rangoSalarial;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public RangoSalarial getPresupuesto() {
        return presupuesto;
    }
    public void setPresupuesto(RangoSalarial presupuesto) {
        this.presupuesto = presupuesto;
    }
    public List<RequisitoVacante> getRequisitos() {
        return requisitos;
    }
    public void setRequisitos(List<RequisitoVacante> requisitos) {
        this.requisitos = requisitos;
    }
    public Integer getExpMinimaAnios() {
        return expMinimaAnios;
    }
    public void setExpMinimaAnios(Integer expMinimaAnios) {
        this.expMinimaAnios = expMinimaAnios;
    }
    public NivelEducativo getNivelEducativoMinimo() {
        return nivelEducativoMinimo;
    }
    public void setNivelEducativoMinimo(NivelEducativo nivelEducativoMinimo) {
        this.nivelEducativoMinimo = nivelEducativoMinimo;
    }
    public EstadoVacante getEstado() {
        return estado;
    }
    public void setEstado(EstadoVacante estado) {
        this.estado = estado;
    }
    public LocalDateTime getFechaPublicacion() {
        return fechaPublicacion;
    }
    public void setFechaPublicacion(LocalDateTime fechaPublicacion) {
        this.fechaPublicacion = fechaPublicacion;
    }
    public String getModalidad() {
        return modalidad;
    }
    public void setModalidad(String modalidad) {
        this.modalidad = modalidad;
    }
}
