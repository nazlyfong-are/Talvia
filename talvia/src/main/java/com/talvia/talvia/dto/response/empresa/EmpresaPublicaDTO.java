package com.talvia.talvia.dto.response.empresa;

public class EmpresaPublicaDTO {
    private Long id;
    private String razonSocial;
    private String sector;
    private String descripcion;
    private String ciudad;
    private String sitioWeb;
    private String numeroEmpleados;
    private String logoUrl;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getSitioWeb() { return sitioWeb; }
    public void setSitioWeb(String sitioWeb) { this.sitioWeb = sitioWeb; }
    public String getNumeroEmpleados() { return numeroEmpleados; }
    public void setNumeroEmpleados(String numeroEmpleados) { this.numeroEmpleados = numeroEmpleados; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}