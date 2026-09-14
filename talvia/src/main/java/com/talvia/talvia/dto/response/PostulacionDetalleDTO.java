package com.talvia.talvia.dto.response;

public class PostulacionDetalleDTO {
    private Long id;
    private String vacanteTitulo;
    private String estado;
    private String fecha;
    private String salarioEsperado;
    private String disponibilidad;
    private String experienciaResumen;
    private String cvEnviadoNombre;
    private String cvEnviadoUrl;
    private TrabajadorPerfilResponseDTO candidato;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVacanteTitulo() { return vacanteTitulo; }
    public void setVacanteTitulo(String vacanteTitulo) { this.vacanteTitulo = vacanteTitulo; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public String getSalarioEsperado() { return salarioEsperado; }
    public void setSalarioEsperado(String salarioEsperado) { this.salarioEsperado = salarioEsperado; }
    public String getDisponibilidad() { return disponibilidad; }
    public void setDisponibilidad(String disponibilidad) { this.disponibilidad = disponibilidad; }
    public String getExperienciaResumen() { return experienciaResumen; }
    public void setExperienciaResumen(String experienciaResumen) { this.experienciaResumen = experienciaResumen; }
    public String getCvEnviadoNombre() { return cvEnviadoNombre; }
    public void setCvEnviadoNombre(String cvEnviadoNombre) { this.cvEnviadoNombre = cvEnviadoNombre; }
    public String getCvEnviadoUrl() { return cvEnviadoUrl; }
    public void setCvEnviadoUrl(String cvEnviadoUrl) { this.cvEnviadoUrl = cvEnviadoUrl; }
    public TrabajadorPerfilResponseDTO getCandidato() { return candidato; }
    public void setCandidato(TrabajadorPerfilResponseDTO candidato) { this.candidato = candidato; }
}
