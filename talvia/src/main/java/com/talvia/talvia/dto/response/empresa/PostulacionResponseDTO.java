package com.talvia.talvia.dto.response.empresa;

public class PostulacionResponseDTO {
    private Long id;
    private Long trabajadorId;
    private String nombreCompleto;
    private String vacanteTitulo;
    private String fecha;
    private String estado;
    private Long vacanteId;

    public PostulacionResponseDTO() {}
    
    public PostulacionResponseDTO(Long id, Long trabajadorId, String nombreCompleto, String vacanteTitulo, String fecha,
            String estado, Long vacanteId) {
        this.id = id;
        this.trabajadorId = trabajadorId;
        this.nombreCompleto = nombreCompleto;
        this.vacanteTitulo = vacanteTitulo;
        this.fecha = fecha;
        this.estado = estado;
        this.vacanteId = vacanteId;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Long getTrabajadorId() {
        return trabajadorId;
    }
    public void setTrabajadorId(Long trabajadorId) {
        this.trabajadorId = trabajadorId;
    }
    public String getNombreCompleto() {
        return nombreCompleto;
    }
    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }
    public String getVacanteTitulo() {
        return vacanteTitulo;
    }
    public void setVacanteTitulo(String vacanteTitulo) {
        this.vacanteTitulo = vacanteTitulo;
    }
    public String getFecha() {
        return fecha;
    }
    public void setFecha(String fecha) {
        this.fecha = fecha;
    }
    public String getEstado() {
        return estado;
    }
    public void setEstado(String estado) {
        this.estado = estado;
    }
    public Long getVacanteId() { return vacanteId; }
public void setVacanteId(Long vacanteId) { this.vacanteId = vacanteId; }
}
