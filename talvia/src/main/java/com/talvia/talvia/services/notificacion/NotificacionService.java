package com.talvia.talvia.services.notificacion;

import java.util.List;

import com.talvia.talvia.dto.response.notificacion.NotificacionResponseDTO;
import com.talvia.talvia.model.enums.TipoNotificacion;
import com.talvia.talvia.model.usuario.Usuario;

public interface NotificacionService {
    void crear(Usuario usuario, TipoNotificacion tipo, String mensaje, String urlDestino);
    List<NotificacionResponseDTO> listar(Long usuarioId);
    long contarNoLeidas(Long usuarioId);
    void marcarComoLeida(Long usuarioId, Long notificacionId);
    void marcarTodasComoLeidas(Long usuarioId);
}
