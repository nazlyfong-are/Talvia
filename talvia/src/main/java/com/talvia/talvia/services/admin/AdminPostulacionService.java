package com.talvia.talvia.services.admin;

import java.time.LocalDate;

import com.talvia.talvia.dto.response.admin.AdminPostulacionDTO;
import com.talvia.talvia.dto.response.comunes.PaginaDTO;

public interface AdminPostulacionService {
    PaginaDTO<AdminPostulacionDTO> listar(String estado, LocalDate desde, LocalDate hasta, int pagina);
}
