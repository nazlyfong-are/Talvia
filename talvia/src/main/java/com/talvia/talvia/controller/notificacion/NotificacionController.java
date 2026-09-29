package com.talvia.talvia.controller.notificacion;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.notificacion.NotificacionService;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    @Autowired private NotificacionService notificacionService;

    @GetMapping
    public ResponseEntity<?> listar(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificacionService.listar(principal.getId()));
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<?> contarNoLeidas(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("total", notificacionService.contarNoLeidas(principal.getId())));
    }

    @PutMapping("/{id}/leida")
    public ResponseEntity<?> marcarLeida(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        notificacionService.marcarComoLeida(principal.getId(), id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<?> marcarTodasLeidas(@AuthenticationPrincipal UserPrincipal principal) {
        notificacionService.marcarTodasComoLeidas(principal.getId());
        return ResponseEntity.ok().build();
    }
}
