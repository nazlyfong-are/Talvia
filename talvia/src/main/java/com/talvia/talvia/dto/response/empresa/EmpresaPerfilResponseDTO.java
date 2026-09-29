package com.talvia.talvia.dto.response.empresa;

public class EmpresaPerfilResponseDTO {
    private Long id;
    private String razonSocial;
    private String correoElectronico;
    private String telefono;
    private String ciudad;
    private String sector;
    private String descripcion;
    private String sitioWeb;
    private String numeroEmpleados;
    private String logoUrl;
    private String figuraLegal;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getSitioWeb() { return sitioWeb; }
    public void setSitioWeb(String sitioWeb) { this.sitioWeb = sitioWeb; }
    public String getNumeroEmpleados() { return numeroEmpleados; }
    public void setNumeroEmpleados(String numeroEmpleados) { this.numeroEmpleados = numeroEmpleados; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getFiguraLegal() { return figuraLegal; }
    public void setFiguraLegal(String figuraLegal) { this.figuraLegal = figuraLegal; }
}
