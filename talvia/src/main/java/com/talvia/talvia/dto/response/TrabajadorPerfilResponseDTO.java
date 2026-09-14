package com.talvia.talvia.dto.response;

import java.util.List;

import com.talvia.talvia.dto.HabilidadDTO;

public class TrabajadorPerfilResponseDTO {

    private Long id;
    private String nombres;
    private String primerApellido;
    private String segundoApellido;
    private String correoElectronico;
    private String telefono;
    private String ciudad;
    private String especialidad;
    private String fotoUrl;
    private Double anosExperienciaTotal;
    private boolean disponibleInmediato;
    private List<FormacionResponsiveDTO> formaciones;
    private List<ExperienciaResponseDTO> experiencias;
    private List<HabilidadDTO> habilidadesTecnicas;
    private List<HabilidadDTO> idiomas;
    private List<CertificacionResponseDTO> certificaciones;
    private List<CvDocumentoResponseDTO> cvs;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getPrimerApellido() { return primerApellido; }
    public void setPrimerApellido(String primerApellido) { this.primerApellido = primerApellido; }
    public String getSegundoApellido() { return segundoApellido; }
    public void setSegundoApellido(String segundoApellido) { this.segundoApellido = segundoApellido; }
    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }
    public Double getAnosExperienciaTotal() { return anosExperienciaTotal; }
    public void setAnosExperienciaTotal(Double anosExperienciaTotal) { this.anosExperienciaTotal = anosExperienciaTotal; }
    public boolean isDisponibleInmediato() { return disponibleInmediato; }
    public void setDisponibleInmediato(boolean disponibleInmediato) { this.disponibleInmediato = disponibleInmediato; }
    public List<FormacionResponsiveDTO> getFormaciones() { return formaciones; }
    public void setFormaciones(List<FormacionResponsiveDTO> formaciones) { this.formaciones = formaciones; }
    public List<ExperienciaResponseDTO> getExperiencias() { return experiencias; }
    public void setExperiencias(List<ExperienciaResponseDTO> experiencias) { this.experiencias = experiencias; }
    public List<HabilidadDTO> getHabilidadesTecnicas() { return habilidadesTecnicas; }
    public void setHabilidadesTecnicas(List<HabilidadDTO> habilidadesTecnicas) { this.habilidadesTecnicas = habilidadesTecnicas; }
    public List<HabilidadDTO> getIdiomas() { return idiomas; }
    public void setIdiomas(List<HabilidadDTO> idiomas) { this.idiomas = idiomas; }
    public List<CertificacionResponseDTO> getCertificaciones() { return certificaciones; }
    public void setCertificaciones(List<CertificacionResponseDTO> certificaciones) { this.certificaciones = certificaciones; }
    public List<CvDocumentoResponseDTO> getCvs() { return cvs; }
    public void setCvs(List<CvDocumentoResponseDTO> cvs) { this.cvs = cvs; }
}