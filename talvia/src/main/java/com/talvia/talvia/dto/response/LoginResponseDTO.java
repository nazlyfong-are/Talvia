package com.talvia.talvia.dto.response;

public class LoginResponseDTO {

    private String id;
    private String correoElectronico;
    private String role;
    private String mensaje;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(String id, String correoElectronico, String role, String mensaje) {
        this.id = id;
        this.correoElectronico = correoElectronico;
        this.role = role;
        this.mensaje = mensaje;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCorreoElectronico() {
        return correoElectronico;
    }

    public void setCorreoElectronico(String correoElectronico) {
        this.correoElectronico = correoElectronico;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    
}