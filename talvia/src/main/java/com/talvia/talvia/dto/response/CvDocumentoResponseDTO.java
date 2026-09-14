package com.talvia.talvia.dto.response;

public class CvDocumentoResponseDTO {
    private Long id;
    private String nombre;
    private String url;
    private String fechaSubida;

    public CvDocumentoResponseDTO() {}
    public CvDocumentoResponseDTO(Long id, String nombre, String url, String fechaSubida) {
        this.id = id; this.nombre = nombre; this.url = url; this.fechaSubida = fechaSubida;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(String fechaSubida) { this.fechaSubida = fechaSubida; }
}
