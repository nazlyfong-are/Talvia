package com.talvia.talvia.repository.proceso;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talvia.talvia.model.proceso.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long>{
    List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    long countByUsuarioIdAndLeidaFalse(Long usuarioId);
}
