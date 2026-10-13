package com.talvia.talvia.servicesIMPL.admin;

import com.talvia.talvia.model.embedded.Formacion;
import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.enums.NivelEducativo;
import com.talvia.talvia.model.proceso.Postulacion;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.vacante.Vacante;
import com.talvia.talvia.repository.proceso.PostulacionRepository;
import com.talvia.talvia.services.admin.AdminExportService;

import jakarta.persistence.criteria.Predicate;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminExportServiceIMPL implements AdminExportService {

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private static final String[] ENCABEZADOS = {
        "ID Postulación", "Fecha de Postulación", "Vista por la Empresa",
        "Años de Experiencia", "Ciudad del Trabajador", "Especialidad", "Nivel Educativo Máximo",
        "Área de la Vacante", "Ubicación de la Vacante", "Modalidad", "Nivel del Cargo", "Experiencia Mínima Requerida (años)",
        "Presupuesto Mínimo", "Presupuesto Máximo", "Moneda",
        "Salario Esperado", "Disponibilidad", "Estado Final"
};

    @Autowired private PostulacionRepository postulacionRepository;

    @Override
    @Transactional(readOnly = true)
    public void exportarPostulacionesCsv(LocalDate desde, LocalDate hasta, HttpServletResponse response) throws IOException {

        LocalDateTime desdeDt = desde != null ? desde.atStartOfDay() : null;
        LocalDateTime hastaDt = hasta != null ? hasta.plusDays(1).atStartOfDay() : null;

        Specification<Postulacion> spec = (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();
            if (desdeDt != null) condiciones.add(cb.greaterThanOrEqualTo(root.get("fechaPostulacion"), desdeDt));
            if (hastaDt != null) condiciones.add(cb.lessThan(root.get("fechaPostulacion"), hastaDt));
            return cb.and(condiciones.toArray(new Predicate[0]));
        };

        List<Postulacion> postulaciones = postulacionRepository.findAll(spec,
                Sort.by(Sort.Direction.ASC, "fechaPostulacion"));

        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"postulaciones_export.csv\"");

        PrintWriter writer = response.getWriter();
        writer.write('\uFEFF'); // BOM: para que Excel detecte UTF-8 y no rompa tildes/ñ

        writer.println(String.join(",", ENCABEZADOS));

        for (Postulacion p : postulaciones) {
            writer.println(construirFila(p));
        }

        writer.flush();
    }

    private String construirFila(Postulacion p) {
        Trabajador t = p.getTrabajador();
        Vacante v = p.getVacante();
        RangoSalarial presupuesto = v != null ? v.getPresupuesto() : null;

        List<String> campos = new ArrayList<>();
        campos.add(String.valueOf(p.getId()));
        campos.add(p.getFechaPostulacion() != null ? p.getFechaPostulacion().toLocalDate().format(FORMATO_FECHA) : "");
        campos.add(p.getFechaVista() != null ? "true" : "false");

        campos.add(t != null && t.getAnosExperienciaTotal() != null ? t.getAnosExperienciaTotal().toString() : "");
        campos.add(t != null ? t.getCiudad() : "");
        campos.add(t != null ? t.getEspecilidad() : "");
        campos.add(t != null ? nivelEducativoMaximo(t) : "");

        campos.add(v != null ? v.getArea() : "");
        campos.add(v != null ? v.getUbicacion() : "");
        campos.add(v != null ? v.getModalidad() : "");
        campos.add(v != null ? v.getNivelCargo() : "");
        campos.add(v != null && v.getExpMinimaAnios() != null ? v.getExpMinimaAnios().toString() : "");

        campos.add(presupuesto != null && presupuesto.getMontoMin() != null ? presupuesto.getMontoMin().toString() : "");
        campos.add(presupuesto != null && presupuesto.getMontoMax() != null ? presupuesto.getMontoMax().toString() : "");
        campos.add(presupuesto != null ? presupuesto.getMoneda() : "");

        campos.add(p.getSalarioEsperado());
        campos.add(p.getDisponibilidad());
        campos.add(p.getEstado() != null ? p.getEstado().name() : "");

        return campos.stream().map(this::escaparCsv).reduce((a, b) -> a + "," + b).orElse("");
    }

    /** Devuelve el nivel educativo más alto entre las formaciones del trabajador, o vacío si no tiene ninguna. */
    private String nivelEducativoMaximo(Trabajador t) {
        NivelEducativo maximo = null;
        for (Formacion f : t.getFormaciones()) {
            if (f.getNivel() == null) continue;
            if (maximo == null || f.getNivel().ordinal() > maximo.ordinal()) {
                maximo = f.getNivel();
            }
        }
        return maximo != null ? maximo.name() : "";
    }

    /** Envuelve el valor en comillas y escapa comillas internas, para que comas o saltos de línea no rompan el CSV. */
    private String escaparCsv(String valor) {
        if (valor == null) return "\"\"";
        return "\"" + valor.replace("\"", "\"\"") + "\"";
    }
}