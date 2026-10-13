package com.talvia.talvia.services.admin;

import com.talvia.talvia.dto.response.admin.AdminVacanteDTO;
import com.talvia.talvia.dto.response.comunes.PaginaDTO;

public interface AdminVacanteService {
    PaginaDTO<AdminVacanteDTO> listar(String estado, String area, String q, int pagina);
    AdminVacanteDTO cambiarEstado(Long id, String nuevoEstado);
    void eliminar(Long id);
}
