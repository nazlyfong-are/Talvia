package com.talvia.talvia.dto.request.trabajador;

import java.util.List;

import com.talvia.talvia.dto.request.comunes.HabilidadDTO;

public class TrabajadorPerfilUpdateDTO {
    private String nombres;
    private String primerApellido;
    private String segundoApellido;
    private String telefono;
    private String ciudad;
    private String especialidad;
    private Double anosExperienciaTotal;
    private Boolean disponibleInmediato;
    private List<FormacionUpdateDTO> formaciones;
    private List<ExperienciaUpdateDTO> experiencias;
    private List<HabilidadDTO> habilidadesTecnicas;
    private List<HabilidadDTO> idiomas;
    private List<CertificacionUpdateDTO> certificaciones;
    private List<String> apoyos;                 // null = la sección no vino; lista vacía = sin respuesta
private String apoyosNota;
private Boolean autorizaTratamientoApoyos;

    public TrabajadorPerfilUpdateDTO() {}

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getPrimerApellido() { return primerApellido; }
    public void setPrimerApellido(String primerApellido) { this.primerApellido = primerApellido; }
    public String getSegundoApellido() { return segundoApellido; }
    public void setSegundoApellido(String segundoApellido) { this.segundoApellido = segundoApellido; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    public Double getAnosExperienciaTotal() { return anosExperienciaTotal; }
    public void setAnosExperienciaTotal(Double anosExperienciaTotal) { this.anosExperienciaTotal = anosExperienciaTotal; }
    public Boolean getDisponibleInmediato() { return disponibleInmediato; }
    public void setDisponibleInmediato(Boolean disponibleInmediato) { this.disponibleInmediato = disponibleInmediato; }
    public List<FormacionUpdateDTO> getFormaciones() { return formaciones; }
    public void setFormaciones(List<FormacionUpdateDTO> formaciones) { this.formaciones = formaciones; }
    public List<ExperienciaUpdateDTO> getExperiencias() { return experiencias; }
    public void setExperiencias(List<ExperienciaUpdateDTO> experiencias) { this.experiencias = experiencias; }
    public List<HabilidadDTO> getHabilidadesTecnicas() { return habilidadesTecnicas; }
    public void setHabilidadesTecnicas(List<HabilidadDTO> habilidadesTecnicas) { this.habilidadesTecnicas = habilidadesTecnicas; }
    public List<HabilidadDTO> getIdiomas() { return idiomas; }
    public void setIdiomas(List<HabilidadDTO> idiomas) { this.idiomas = idiomas; }
    public List<CertificacionUpdateDTO> getCertificaciones() { return certificaciones; }
    public void setCertificaciones(List<CertificacionUpdateDTO> certificaciones) { this.certificaciones = certificaciones; }
    public List<String> getApoyos() { return apoyos; }
public void setApoyos(List<String> apoyos) { this.apoyos = apoyos; }
public String getApoyosNota() { return apoyosNota; }
public void setApoyosNota(String apoyosNota) { this.apoyosNota = apoyosNota; }
public Boolean getAutorizaTratamientoApoyos() { return autorizaTratamientoApoyos; }
public void setAutorizaTratamientoApoyos(Boolean a) { this.autorizaTratamientoApoyos = a; }

}