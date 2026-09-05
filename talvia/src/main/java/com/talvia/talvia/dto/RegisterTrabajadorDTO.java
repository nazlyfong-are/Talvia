package com.talvia.talvia.dto;

import java.util.List;

public class RegisterTrabajadorDTO {

    private String nombres;
    private String primerApellido;
    private String segundoApellido;
    private String tipoDocumento;
    private String numeroDocumento;
    private String correoElectronico;
    private String numeroTelefono;
    private String contrasena;

    private String especialidad;
    private String resumenProfesional;
    private String ciudad;
    private Integer aniosExperienciaTotal;

    private List<FormacionDTO> formaciones;
    private List<ExperienciaDTO> experiencias;
    private List<HabilidadDTO> habilidades;
    private List<CertificacionDTO> certificaciones;

    public RegisterTrabajadorDTO() {}

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }

    public String getPrimerApellido() { return primerApellido; }
    public void setPrimerApellido(String primerApellido) { this.primerApellido = primerApellido; }

    public String getSegundoApellido() { return segundoApellido; }
    public void setSegundoApellido(String segundoApellido) { this.segundoApellido = segundoApellido; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }

    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }

    public String getNumeroTelefono() { return numeroTelefono; }
    public void setNumeroTelefono(String numeroTelefono) { this.numeroTelefono = numeroTelefono; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public String getResumenProfesional() {
        return resumenProfesional;
    }

    public void setResumenProfesional(String resumenProfesional) {
        this.resumenProfesional = resumenProfesional;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public Integer getAniosExperienciaTotal() {
        return aniosExperienciaTotal;
    }

    public void setAniosExperienciaTotal(Integer aniosExperienciaTotal) {
        this.aniosExperienciaTotal = aniosExperienciaTotal;
    }

    public List<FormacionDTO> getFormaciones() {
        return formaciones;
    }

    public void setFormaciones(List<FormacionDTO> formaciones) {
        this.formaciones = formaciones;
    }

    public List<ExperienciaDTO> getExperiencias() {
        return experiencias;
    }

    public void setExperiencias(List<ExperienciaDTO> experiencias) {
        this.experiencias = experiencias;
    }

    public List<HabilidadDTO> getHabilidades() {
        return habilidades;
    }

    public void setHabilidades(List<HabilidadDTO> habilidades) {
        this.habilidades = habilidades;
    }

    public List<CertificacionDTO> getCertificaciones() {
        return certificaciones;
    }

    public void setCertificaciones(List<CertificacionDTO> certificaciones) {
        this.certificaciones = certificaciones;
    }
}