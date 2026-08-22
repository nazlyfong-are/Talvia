package com.talvia.talvia.model.proceso;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.enums.EstadoSolicitud;
import com.talvia.talvia.model.usuario.Empresa;

@Document(collection = "solicitudes_compatibilidad")
public class SolicitudCompatibilidad {

    @Id
    private String id;
    @DBRef
    private Empresa empresaSolicitante;
    private String especialidadBuscada;
    private List<String> habilidadesRequeridas;
    private RangoSalarial presupuestoDisponible;
    private Integer experienciaMinima;
    private LocalDateTime fechaSolicitud;
    private List<String> trabajadorIdsSugeridos;
    private EstadoSolicitud estado;
    
    public SolicitudCompatibilidad() {
    }
    public SolicitudCompatibilidad(String id, Empresa empresaSolicitante, String especialidadBuscada,
            List<String> habilidadesRequeridas, RangoSalarial presupuestoDisponible, Integer experienciaMinima,
            LocalDateTime fechaSolicitud, List<String> trabajadorIdsSugeridos, EstadoSolicitud estado) {
        this.id = id;
        this.empresaSolicitante = empresaSolicitante;
        this.especialidadBuscada = especialidadBuscada;
        this.habilidadesRequeridas = habilidadesRequeridas;
        this.presupuestoDisponible = presupuestoDisponible;
        this.experienciaMinima = experienciaMinima;
        this.fechaSolicitud = fechaSolicitud;
        this.trabajadorIdsSugeridos = trabajadorIdsSugeridos;
        this.estado = estado;
    }
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public Empresa getEmpresaSolicitante() {
        return empresaSolicitante;
    }
    public void setEmpresaSolicitante(Empresa empresaSolicitante) {
        this.empresaSolicitante = empresaSolicitante;
    }
    public String getEspecialidadBuscada() {
        return especialidadBuscada;
    }
    public void setEspecialidadBuscada(String especialidadBuscada) {
        this.especialidadBuscada = especialidadBuscada;
    }
    public List<String> getHabilidadesRequeridas() {
        return habilidadesRequeridas;
    }
    public void setHabilidadesRequeridas(List<String> habilidadesRequeridas) {
        this.habilidadesRequeridas = habilidadesRequeridas;
    }
    public RangoSalarial getPresupuestoDisponible() {
        return presupuestoDisponible;
    }
    public void setPresupuestoDisponible(RangoSalarial presupuestoDisponible) {
        this.presupuestoDisponible = presupuestoDisponible;
    }
    public Integer getExperienciaMinima() {
        return experienciaMinima;
    }
    public void setExperienciaMinima(Integer experienciaMinima) {
        this.experienciaMinima = experienciaMinima;
    }
    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }
    public List<String> getTrabajadorIdsSugeridos() {
        return trabajadorIdsSugeridos;
    }
    public void setTrabajadorIdsSugeridos(List<String> trabajadorIdsSugeridos) {
        this.trabajadorIdsSugeridos = trabajadorIdsSugeridos;
    }
    public EstadoSolicitud getEstado() {
        return estado;
    }
    public void setEstado(EstadoSolicitud estado) {
        this.estado = estado;
    }
}
