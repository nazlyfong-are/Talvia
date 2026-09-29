package com.talvia.talvia.dto.response.empresa;

import java.util.List;

public class VacanteDetalleEdicionDTO {
    private Long id;
    private String titulo;
    private String ubicacion;
    private String area;
    private Integer expMinimaAnios;
    private String modalidad;
    private String nivelCargo;
    private String descripcion;
    private String beneficios;
    private Double montoMinimo;
    private Double montoMaximo;
    private String moneda;
    private String periodicidad;
    private String nivelEducativoMinimo;
    private List<String> requisitos;
    private String estado;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public Integer getExpMinimaAnios() { return expMinimaAnios; }
    public void setExpMinimaAnios(Integer expMinimaAnios) { this.expMinimaAnios = expMinimaAnios; }
    public String getModalidad() { return modalidad; }
    public void setModalidad(String modalidad) { this.modalidad = modalidad; }
    public String getNivelCargo() { return nivelCargo; }
    public void setNivelCargo(String nivelCargo) { this.nivelCargo = nivelCargo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getBeneficios() { return beneficios; }
    public void setBeneficios(String beneficios) { this.beneficios = beneficios; }
    public Double getMontoMinimo() { return montoMinimo; }
    public void setMontoMinimo(Double montoMinimo) { this.montoMinimo = montoMinimo; }
    public Double getMontoMaximo() { return montoMaximo; }
    public void setMontoMaximo(Double montoMaximo) { this.montoMaximo = montoMaximo; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
    public String getPeriodicidad() { return periodicidad; }
    public void setPeriodicidad(String periodicidad) { this.periodicidad = periodicidad; }
    public String getNivelEducativoMinimo() { return nivelEducativoMinimo; }
    public void setNivelEducativoMinimo(String nivelEducativoMinimo) { this.nivelEducativoMinimo = nivelEducativoMinimo; }
    public List<String> getRequisitos() { return requisitos; }
    public void setRequisitos(List<String> requisitos) { this.requisitos = requisitos; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}