package com.talvia.talvia.dto.request.auth;

public class VerificarCorreoDTO {
    private String correoElectronico;
    private String codigo;

    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
}
