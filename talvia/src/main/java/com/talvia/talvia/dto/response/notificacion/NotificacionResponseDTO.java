package com.talvia.talvia.dto.response.notificacion;

public class NotificacionResponseDTO {
    private Long id;
    private String tipo;
    private String mensaje;
    private String urlDestino;
    private String fecha;
    private boolean leida;

    public NotificacionResponseDTO() {}
    public NotificacionResponseDTO(Long id, String tipo, String mensaje, String urlDestino, String fecha, boolean leida) {
        this.id = id; this.tipo = tipo; this.mensaje = mensaje;
        this.urlDestino = urlDestino; this.fecha = fecha; this.leida = leida;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public String getUrlDestino() { return urlDestino; }
    public void setUrlDestino(String urlDestino) { this.urlDestino = urlDestino; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public boolean isLeida() { return leida; }
    public void setLeida(boolean leida) { this.leida = leida; }
}
