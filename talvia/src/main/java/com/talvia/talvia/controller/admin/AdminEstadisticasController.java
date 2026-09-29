package com.talvia.talvia.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.services.admin.AdminEstadisticasService;

@RestController 
@RequestMapping("/api/admin/estadisticas")
public class AdminEstadisticasController {

    @Autowired private AdminEstadisticasService estadisticasService;

    @GetMapping
    public ResponseEntity<?> obtener(){
        return ResponseEntity.ok(estadisticasService.obtenerEstadisticas());
    }
}
