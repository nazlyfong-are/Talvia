package com.talvia.talvia.dto.response;

public class PostulacionTrabajadorResponseDTO {
    private Long id;
    private Long vacanteId;
    private String titulo;
    private String empresa;
    private String logoUrl;
    private String ubicacion;
    private String salario;
    private String fechaIso;   // para ordenar en JS
    private String fechaTexto; // para mostrar
    private String estado;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getVacanteId() { return vacanteId; }
    public void setVacanteId(Long vacanteId) { this.vacanteId = vacanteId; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public String getSalario() { return salario; }
    public void setSalario(String salario) { this.salario = salario; }
    public String getFechaIso() { return fechaIso; }
    public void setFechaIso(String fechaIso) { this.fechaIso = fechaIso; }
    public String getFechaTexto() { return fechaTexto; }
    public void setFechaTexto(String fechaTexto) { this.fechaTexto = fechaTexto; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
