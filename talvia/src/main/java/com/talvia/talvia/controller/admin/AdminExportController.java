package com.talvia.talvia.controller.admin;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.services.admin.AdminExportService;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/exportar")
public class AdminExportController {

    @Autowired private AdminExportService exportService;

    @GetMapping("/postulaciones")
    public void exportarPostulaciones(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            HttpServletResponse response) throws IOException {
        exportService.exportarPostulacionesCsv(desde, hasta, response);
    }
}