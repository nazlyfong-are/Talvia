package com.talvia.talvia.dto.request.trabajador;

public class PostulacionCreateDTO {

   private Long vacanteId;
    private Long cvId;
    private String salarioEsperado;
    private String disponibilidad;
    private String expResumen;

    public Long getVacanteId() { return vacanteId; }
    public void setVacanteId(Long vacanteId) { this.vacanteId = vacanteId; }
    public Long getCvId() { return cvId; }
    public void setCvId(Long cvId) { this.cvId = cvId; }
    public String getSalarioEsperado() { return salarioEsperado; }
    public void setSalarioEsperado(String salarioEsperado) { this.salarioEsperado = salarioEsperado; }
    public String getDisponibilidad() { return disponibilidad; }
    public void setDisponibilidad(String disponibilidad) { this.disponibilidad = disponibilidad; }
    public String getExpResumen() { return expResumen; }
    public void setExpResumen(String expResumen) { this.expResumen = expResumen; }
}
