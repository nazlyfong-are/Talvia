package com.talvia.talvia.dto.request.empresa;

public class EmpresaPerfilUpdateDTO {
    private String razonSocial;
    private String ciudad;
    private String sector;
    private String descripcion;
    private String sitioWeb;
    private String numeroEmpleados;
    private String figuraLegal;

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
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
    public String getFiguraLegal() { return figuraLegal; }
    public void setFiguraLegal(String figuraLegal) { this.figuraLegal = figuraLegal; }
}
