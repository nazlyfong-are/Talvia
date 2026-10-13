package com.talvia.talvia.dto.request.auth;

public class RegisterEmpresaDTO {

    private String razonSocial;
    private String figuraLegal;
    private String nit;
    private String correoElectronico;
    private String numeroTelefono;
    private String contrasena;
    private String sector;

    public RegisterEmpresaDTO() {}

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }

    public String getFiguraLegal() { return figuraLegal; }
    public void setFiguraLegal(String figuraLegal) { this.figuraLegal = figuraLegal; }

    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }

    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }

    public String getNumeroTelefono() { return numeroTelefono; }
    public void setNumeroTelefono(String numeroTelefono) { this.numeroTelefono = numeroTelefono; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public String getSector() { return sector; }

    public void setSector(String sector) { this.sector = sector; }
    
}