package com.talvia.talvia.dto.response;

public class VacantesResponseDTO {

    private Long id;
    private String titulo;
    private String empresa;
    private String ubicacion;
    private String logoUrl;
    private String area;
    private Integer experiencia;
    private String modalidad;
    private String nivel;
    private String salario;
    private String fecha;
    private String descripcion;
    private String requisitosTexto;
    private String beneficios;
    private String nivelEducativoMinimo;
    
    public VacantesResponseDTO() {
    }
    
    public VacantesResponseDTO(Long id, String titulo, String empresa, String ubicacion, String logoUrl, String area,
            Integer experiencia, String modalidad, String nivel, String salario, String fecha, String descripcion,
            String requisitosTexto, String beneficios, String nivelEducativoMinimo) {
        this.id = id;
        this.titulo = titulo;
        this.empresa = empresa;
        this.ubicacion = ubicacion;
        this.logoUrl = logoUrl;
        this.area = area;
        this.experiencia = experiencia;
        this.modalidad = modalidad;
        this.nivel = nivel;
        this.salario = salario;
        this.fecha = fecha;
        this.descripcion = descripcion;
        this.requisitosTexto = requisitosTexto;
        this.beneficios = beneficios;
        this.nivelEducativoMinimo = nivelEducativoMinimo;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitulo() {
        return titulo;
    }
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    public String getEmpresa() {
        return empresa;
    }
    public void setEmpresa(String empresa) {
        this.empresa = empresa;
    }
    public String getUbicacion() {
        return ubicacion;
    }
    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }
    public String getLogoUrl() {
        return logoUrl;
    }
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
    public String getArea() {
        return area;
    }
    public void setArea(String area) {
        this.area = area;
    }
    public Integer getExperiencia() {
        return experiencia;
    }
    public void setExperiencia(Integer experiencia) {
        this.experiencia = experiencia;
    }
    public String getModalidad() {
        return modalidad;
    }
    public void setModalidad(String modalidad) {
        this.modalidad = modalidad;
    }
    public String getNivel() {
        return nivel;
    }
    public void setNivel(String nivel) {
        this.nivel = nivel;
    }
    public String getSalario() {
        return salario;
    }
    public void setSalario(String salario) {
        this.salario = salario;
    }
    public String getFecha() {
        return fecha;
    }
    public void setFecha(String fecha) {
        this.fecha = fecha;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public String getRequisitosTexto() {
        return requisitosTexto;
    }
    public void setRequisitosTexto(String requisitosTexto) {
        this.requisitosTexto = requisitosTexto;
    }
    public String getBeneficios() {
        return beneficios;
    }
    public void setBeneficios(String beneficios) {
        this.beneficios = beneficios;
    }
    public String getNivelEducativoMinimo() {
        return nivelEducativoMinimo;
    }
    public void setNivelEducativoMinimo(String nivelEducativoMinimo) {
        this.nivelEducativoMinimo = nivelEducativoMinimo;
    }
    
}
