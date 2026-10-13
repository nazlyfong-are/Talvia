package com.talvia.talvia.dto.response;

public class EmpresaResponseDTO {

    private Long id;
    private String razonSocial;
    private String sector;
    private String descripcion;
    private String ciudad;
    private String logoUrl;
    private Long vacantesActivas;
    
    public EmpresaResponseDTO() {
    }
    public EmpresaResponseDTO(Long id, String razonSocial, String sector, String descripcion, String ciudad,
            String logoUrl, Long vacantesActivas) {
        this.id = id;
        this.razonSocial = razonSocial;
        this.sector = sector;
        this.descripcion = descripcion;
        this.ciudad = ciudad;
        this.logoUrl = logoUrl;
        this.vacantesActivas = vacantesActivas;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getRazonSocial() {
        return razonSocial;
    }
    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }
    public String getSector() {
        return sector;
    }
    public void setSector(String sector) {
        this.sector = sector;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public String getCiudad() {
        return ciudad;
    }
    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }
    public String getLogoUrl() {
        return logoUrl;
    }
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
    public Long getVacantesActivas() {
        return vacantesActivas;
    }
    public void setVacantesActivas(Long vacantesActivas) {
        this.vacantesActivas = vacantesActivas;
    }
}
