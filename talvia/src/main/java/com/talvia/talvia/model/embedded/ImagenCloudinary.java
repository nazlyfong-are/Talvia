package com.talvia.talvia.model.embedded;

import java.time.LocalDateTime;

public class ImagenCloudinary {

    private String url;
    private String publicId;
    private LocalDateTime fechaSubida;
    public ImagenCloudinary() {
    }
    public ImagenCloudinary(String url, String publicId, LocalDateTime fechaSubida) {
        this.url = url;
        this.publicId = publicId;
        this.fechaSubida = fechaSubida;
    }
    public String getUrl() {
        return url;
    }
    public void setUrl(String url) {
        this.url = url;
    }
    public String getPublicId() {
        return publicId;
    }
    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }
    public LocalDateTime getFechaSubida() {
        return fechaSubida;
    }
    public void setFechaSubida(LocalDateTime fechaSubida) {
        this.fechaSubida = fechaSubida;
    }
}
