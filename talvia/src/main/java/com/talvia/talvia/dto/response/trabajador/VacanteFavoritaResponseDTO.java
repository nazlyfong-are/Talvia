package com.talvia.talvia.dto.response.trabajador;

import com.talvia.talvia.dto.response.vacante.VacantesResponseDTO;

public class VacanteFavoritaResponseDTO {
    private Long favoritoId;
    private VacantesResponseDTO vacante;

    public VacanteFavoritaResponseDTO() {
    }
    public VacanteFavoritaResponseDTO(Long favoritoId, VacantesResponseDTO vacante) {
        this.favoritoId = favoritoId;
        this.vacante = vacante;
    }
    
    public Long getFavoritoId() { return favoritoId;}
    public void setFavoritoId(Long favoritoId) {this.favoritoId = favoritoId;}
    public VacantesResponseDTO getVacante() {return vacante;}
    public void setVacante(VacantesResponseDTO vacante) {this.vacante = vacante;}
    
}
