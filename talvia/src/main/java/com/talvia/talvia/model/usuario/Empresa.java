package com.talvia.talvia.model.usuario;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.Document;

import com.talvia.talvia.model.enums.Rol;
import com.talvia.talvia.model.vacante.Vacante;

@Document(collection = "empresas")
public class Empresa extends Usuario{

    private String razonSocial;
    private String nit;
    private String sector;
    private String descripcion;
    private String logoUrl;
    private String direccion;
    private String ciudad;
    private List<Vacante> vacantesPublicadas;
    
    public Empresa(String id, String nombre, String email, String contrasena, String tlefono,
            LocalDateTime fechaRegistro, boolean activo, Rol rol) {
        super(id, nombre, email, contrasena, tlefono, fechaRegistro, activo, rol);
    }
    public Empresa() {
    }
    public String getRazonSocial() {
        return razonSocial;
    }
    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }
    public String getNit() {
        return nit;
    }
    public void setNit(String nit) {
        this.nit = nit;
    }
    public String getSector() {
        return sector;
    }
    public void setSector(String sector) {
        this.sector = sector;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public String getLogoUrl() {
        return logoUrl;
    }
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
    public String getDireccion() {
        return direccion;
    }
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    public String getCiudad() {
        return ciudad;
    }
    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }
    public List<Vacante> getVacantesPublicadas() {
        return vacantesPublicadas;
    }
    public void setVacantesPublicadas(List<Vacante> vacantesPublicadas) {
        this.vacantesPublicadas = vacantesPublicadas;
    }
}
