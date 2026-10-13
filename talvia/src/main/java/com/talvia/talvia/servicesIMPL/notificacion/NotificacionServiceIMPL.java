package com.talvia.talvia.servicesIMPL.notificacion;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talvia.talvia.dto.response.notificacion.NotificacionResponseDTO;
import com.talvia.talvia.model.enums.TipoNotificacion;
import com.talvia.talvia.model.proceso.Notificacion;
import com.talvia.talvia.model.usuario.Usuario;
import com.talvia.talvia.repository.proceso.NotificacionRepository;
import com.talvia.talvia.services.notificacion.NotificacionService;

import jakarta.transaction.Transactional;

@Service 
public class NotificacionServiceIMPL implements NotificacionService{
    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired private NotificacionRepository notificacionRepository;

    @Override
    public void crear(Usuario usuario, TipoNotificacion tipo, String mensaje, String urlDestino) {
        try {
            Notificacion n = new Notificacion();
            n.setUsuario(usuario);
            n.setTipo(tipo);
            n.setMensaje(mensaje);
            n.setUrlDestino(urlDestino);
            n.setFechaCreacion(LocalDateTime.now());
            n.setLeida(false);
            notificacionRepository.save(n);
        } catch (Exception e) {
            // Igual que con el correo: una notificación fallida nunca debe tumbar el flujo principal
            System.err.println(">>> ERROR AL CREAR NOTIFICACIÓN: " + e.getMessage());
        }
    }

    @Override
    public List<NotificacionResponseDTO> listar(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId).stream()
                .map(n -> new NotificacionResponseDTO(
                        n.getId(), n.getTipo().name(), n.getMensaje(), n.getUrlDestino(),
                        n.getFechaCreacion() != null ? n.getFechaCreacion().format(FORMATO) : "",
                        n.isLeida()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public long contarNoLeidas(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    @Override
    @Transactional
    public void marcarComoLeida(Long usuarioId, Long notificacionId) {
        notificacionRepository.findById(notificacionId).ifPresent(n -> {
            if (n.getUsuario().getId().equals(usuarioId)) {
                n.setLeida(true);
                notificacionRepository.save(n);
            }
        });
    }

    @Override
    @Transactional
    public void marcarTodasComoLeidas(Long usuarioId) {
        List<Notificacion> pendientes = notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
        pendientes.forEach(n -> n.setLeida(true));
        notificacionRepository.saveAll(pendientes);
    }
}
