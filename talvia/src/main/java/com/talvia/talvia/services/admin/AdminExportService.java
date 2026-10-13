package com.talvia.talvia.services.admin;

import java.io.IOException;
import java.time.LocalDate;

import jakarta.servlet.http.HttpServletResponse;

public interface AdminExportService {
    void exportarPostulacionesCsv(LocalDate desde, LocalDate hasta, HttpServletResponse response) throws IOException;
}
