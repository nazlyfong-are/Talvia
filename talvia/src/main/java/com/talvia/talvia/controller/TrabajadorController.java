package com.talvia.talvia.controller;

import com.talvia.talvia.dto.request.TrabajadorPerfilUpdateDTO;
import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.TrabajadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/trabajador")
public class TrabajadorController {

    @Autowired
    private TrabajadorService trabajadorService;

    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(trabajadorService.obtenerPerfil(principal.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarPerfil(@AuthenticationPrincipal UserPrincipal principal,
                                               @RequestBody TrabajadorPerfilUpdateDTO dto) {
        try {
            return ResponseEntity.ok(trabajadorService.actualizarPerfil(principal.getId(), dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping(value = "/perfil/foto", consumes = "multipart/form-data")
    public ResponseEntity<?> subirFoto(@AuthenticationPrincipal UserPrincipal principal,
                                        @RequestParam("archivo") MultipartFile archivo) {
        try {
            String url = trabajadorService.actualizarFoto(principal.getId(), archivo);
            return ResponseEntity.ok(Map.of("fotoUrl", url));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al subir la foto: " + e.getMessage());
        }
    }

    @GetMapping("/perfil/cvs")
    public ResponseEntity<?> listarCvs(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(trabajadorService.listarCvs(principal.getId()));
    }

    @PostMapping(value = "/perfil/cvs", consumes = "multipart/form-data")
    public ResponseEntity<?> subirCv(@AuthenticationPrincipal UserPrincipal principal,
                                      @RequestParam("nombre") String nombre,
                                      @RequestParam("archivo") MultipartFile archivo) {
        try {
            return ResponseEntity.ok(trabajadorService.subirCv(principal.getId(), nombre, archivo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al subir el CV: " + e.getMessage());
        }
    }

    @DeleteMapping("/perfil/cvs/{cvId}")
    public ResponseEntity<?> eliminarCv(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long cvId) {
        try {
            trabajadorService.eliminarCv(principal.getId(), cvId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al eliminar el CV: " + e.getMessage());
        }
    }

    @PostMapping(value = "/perfil/formacion/{formacionId}/documento", consumes = "multipart/form-data")
    public ResponseEntity<?> subirDocumentoFormacion(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable Long formacionId,
                                                      @RequestParam("archivo") MultipartFile archivo) {
        try {
            String url = trabajadorService.adjuntarDocumentoFormacion(principal.getId(), formacionId, archivo);
            return ResponseEntity.ok(Map.of("documentoUrl", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al subir el documento: " + e.getMessage());
        }
    }

    @DeleteMapping("/perfil/formacion/{formacionId}/documento")
    public ResponseEntity<?> eliminarDocumentoFormacion(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable Long formacionId) {
        try {
            trabajadorService.eliminarDocumentoFormacion(principal.getId(), formacionId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al eliminar el documento: " + e.getMessage());
        }
    }

    @PostMapping(value = "/perfil/certificacion/{certificacionId}/documento", consumes = "multipart/form-data")
    public ResponseEntity<?> subirDocumentoCertificacion(@AuthenticationPrincipal UserPrincipal principal,
                                                          @PathVariable Long certificacionId,
                                                          @RequestParam("archivo") MultipartFile archivo) {
        try {
            String url = trabajadorService.adjuntarDocumentoCertificacion(principal.getId(), certificacionId, archivo);
            return ResponseEntity.ok(Map.of("documentoUrl", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al subir el documento: " + e.getMessage());
        }
    }
}