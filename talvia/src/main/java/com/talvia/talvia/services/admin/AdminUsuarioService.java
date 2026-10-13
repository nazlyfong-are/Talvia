package com.talvia.talvia.services.admin;

import com.talvia.talvia.dto.response.admin.AdminUsuarioDTO;
import com.talvia.talvia.dto.response.comunes.PaginaDTO;

public interface AdminUsuarioService {
    PaginaDTO<AdminUsuarioDTO> listar(String rol, String activo, String q, int pagina);
    AdminUsuarioDTO obtener(Long id);
    AdminUsuarioDTO cambiarEstado(Long id, boolean activo);
}
