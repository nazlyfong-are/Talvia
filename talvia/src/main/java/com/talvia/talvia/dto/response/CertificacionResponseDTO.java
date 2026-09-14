package com.talvia.talvia.dto.response;

public class CertificacionResponseDTO {
    private Long id;
    private String nombre;
    private String entidadEmisora;
    private String fechaObtencion;
    private String fechaVencimiento;
    private String documentoUrl;

    public CertificacionResponseDTO() {}
    public CertificacionResponseDTO(Long id, String nombre, String entidadEmisora,
                                     String fechaObtencion, String fechaVencimiento, String documentoUrl) {
        this.id = id; this.nombre = nombre; this.entidadEmisora = entidadEmisora;
        this.fechaObtencion = fechaObtencion; this.fechaVencimiento = fechaVencimiento; this.documentoUrl = documentoUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEntidadEmisora() { return entidadEmisora; }
    public void setEntidadEmisora(String entidadEmisora) { this.entidadEmisora = entidadEmisora; }
    public String getFechaObtencion() { return fechaObtencion; }
    public void setFechaObtencion(String fechaObtencion) { this.fechaObtencion = fechaObtencion; }
    public String getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(String fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public String getDocumentoUrl() { return documentoUrl; }
    public void setDocumentoUrl(String documentoUrl) { this.documentoUrl = documentoUrl; }
}