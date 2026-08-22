package com.talvia.talvia.model.usuario;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.Document;

import com.talvia.talvia.model.embedded.Certificacion;
import com.talvia.talvia.model.embedded.ExpLaboral;
import com.talvia.talvia.model.embedded.Formacion;
import com.talvia.talvia.model.embedded.Habilidad;
import com.talvia.talvia.model.embedded.ImagenCloudinary;
import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.enums.Rol;

@Document(collection = "trabajadores")
public class Trabajador extends Usuario {

    private String especilidad; 
    private String resumenProfesional;
    private List<ExpLaboral> experiencias = new ArrayList<>();
    private List<Habilidad> habilidades = new ArrayList<>();
    private List<Formacion> formaciones = new ArrayList<>();
    private List<Certificacion> certificaciones = new ArrayList<>();
    private RangoSalarial pretensionSalarial;
    private Integer aniosExpTotal;
    private String ciudad;
    private boolean disponibleInmediato;
    private ImagenCloudinary fotoUrl;
    private String cvArchivoUrl;

    public Trabajador() {
    }
    public Trabajador(String id, String nombre, String email, String contrasena, String tlefono,
            LocalDateTime fechaRegistro, boolean activo, Rol rol, String especilidad, String resumenProfesional,
            List<ExpLaboral> experiencias, List<Habilidad> habilidades, List<Formacion> formaciones,
            List<Certificacion> certificaciones, RangoSalarial pretensionSalarial, Integer aniosExpTotal, String ciudad,
            boolean disponibleInmediato, ImagenCloudinary fotoUrl, String cvArchivoUrl) {
        super(id, nombre, email, contrasena, tlefono, fechaRegistro, activo, rol);
        this.especilidad = especilidad;
        this.resumenProfesional = resumenProfesional;
        this.experiencias = experiencias;
        this.habilidades = habilidades;
        this.formaciones = formaciones;
        this.certificaciones = certificaciones;
        this.pretensionSalarial = pretensionSalarial;
        this.aniosExpTotal = aniosExpTotal;
        this.ciudad = ciudad;
        this.disponibleInmediato = disponibleInmediato;
        this.fotoUrl = fotoUrl;
        this.cvArchivoUrl = cvArchivoUrl;
    }
    public Trabajador(String especilidad, String resumenProfesional, List<ExpLaboral> experiencias,
            List<Habilidad> habilidades, List<Formacion> formaciones, List<Certificacion> certificaciones,
            RangoSalarial pretensionSalarial, Integer aniosExpTotal, String ciudad, boolean disponibleInmediato,
            ImagenCloudinary fotoUrl, String cvArchivoUrl) {
        this.especilidad = especilidad;
        this.resumenProfesional = resumenProfesional;
        this.experiencias = experiencias;
        this.habilidades = habilidades;
        this.formaciones = formaciones;
        this.certificaciones = certificaciones;
        this.pretensionSalarial = pretensionSalarial;
        this.aniosExpTotal = aniosExpTotal;
        this.ciudad = ciudad;
        this.disponibleInmediato = disponibleInmediato;
        this.fotoUrl = fotoUrl;
        this.cvArchivoUrl = cvArchivoUrl;
    }
    public String getEspecilidad() {
        return especilidad;
    }

    public void setEspecilidad(String especilidad) {
        this.especilidad = especilidad;
    }

    public String getResumenProfesional() {
        return resumenProfesional;
    }

    public void setResumenProfesional(String resumenProfesional) {
        this.resumenProfesional = resumenProfesional;
    }

    public List<ExpLaboral> getExperiencias() {
        return experiencias;
    }

    public void setExperiencias(List<ExpLaboral> experiencias) {
        this.experiencias = experiencias;
    }

    public List<Habilidad> getHabilidades() {
        return habilidades;
    }

    public void setHabilidades(List<Habilidad> habilidades) {
        this.habilidades = habilidades;
    }

    public List<Formacion> getFormaciones() {
        return formaciones;
    }

    public void setFormaciones(List<Formacion> formaciones) {
        this.formaciones = formaciones;
    }

    public List<Certificacion> getCertificaciones() {
        return certificaciones;
    }

    public void setCertificaciones(List<Certificacion> certificaciones) {
        this.certificaciones = certificaciones;
    }

    public RangoSalarial getPretensionSalarial() {
        return pretensionSalarial;
    }

    public void setPretensionSalarial(RangoSalarial pretensionSalarial) {
        this.pretensionSalarial = pretensionSalarial;
    }

    public Integer getAniosExpTotal() {
        return aniosExpTotal;
    }

    public void setAniosExpTotal(Integer aniosExpTotal) {
        this.aniosExpTotal = aniosExpTotal;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public boolean isDisponibleInmediato() {
        return disponibleInmediato;
    }

    public void setDisponibleInmediato(boolean disponibleInmediato) {
        this.disponibleInmediato = disponibleInmediato;
    }
    public String getCvArchivoUrl() {
        return cvArchivoUrl;
    }

    public void setCvArchivoUrl(String cvArchivoUrl) {
        this.cvArchivoUrl = cvArchivoUrl;
    }
    public ImagenCloudinary getFotoUrl() {
        return fotoUrl;
    }
    public void setFotoUrl(ImagenCloudinary fotoUrl) {
        this.fotoUrl = fotoUrl;
    }
}
