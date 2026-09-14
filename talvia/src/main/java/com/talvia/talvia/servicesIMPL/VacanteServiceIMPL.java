package com.talvia.talvia.servicesIMPL;

import com.talvia.talvia.dto.response.VacantesResponseDTO;
import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.vacante.RequisitoVacante;
import com.talvia.talvia.model.vacante.Vacante;
import com.talvia.talvia.repository.VacanteRepository;
import com.talvia.talvia.services.VacanteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VacanteServiceIMPL implements VacanteService {

    @Autowired
    private VacanteRepository vacanteRepository;

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public List<VacantesResponseDTO> listarActivas() {
        return vacanteRepository.findByEstado(EstadoVacante.ABIERTA)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public VacantesResponseDTO obtenerPorId(Long id) {
        Vacante v = vacanteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vacante no encontrada."));
        return toDTO(v);
    }

    @Override
public VacantesResponseDTO toDTO(Vacante v) {
    String empresaNombre = v.getEmpresa() != null ? v.getEmpresa().getRazonSocial() : "Empresa";
    String logoUrl = (v.getEmpresa() != null && v.getEmpresa().getLogo() != null)
            ? v.getEmpresa().getLogo().getUrl() : null;

    String ubicacion = (v.getUbicacion() != null && !v.getUbicacion().isBlank())
            ? v.getUbicacion()
            : (v.getEmpresa() != null ? v.getEmpresa().getCiudad() : "");

    String salarioTexto = formatearSalario(v.getPresupuesto());
    String requisitosTexto = formatearRequisitos(v.getRequisitos());

    String fechaTexto = v.getFechaPublicacion() != null
            ? v.getFechaPublicacion().toLocalDate().format(FORMATO_FECHA) : "";

    VacantesResponseDTO dto = new VacantesResponseDTO(
            v.getId(),
            v.getTitulo(),
            empresaNombre,
            ubicacion,
            logoUrl,
            v.getArea(),
            v.getExpMinimaAnios(),
            v.getModalidad(),
            v.getNivelCargo(),
            salarioTexto,
            fechaTexto,
            v.getDescripcion(),
            requisitosTexto,
            v.getBeneficios(), fechaTexto
    );
    dto.setNivelEducativoMinimo(v.getNivelEducativoMinimo() != null ? v.getNivelEducativoMinimo().name() : null);
    return dto;
}

private String formatearSalario(RangoSalarial r) {
    if (r == null || r.getMontoMin() == null) return "A convenir";
    String moneda = r.getMoneda() != null ? r.getMoneda() : "COP";
    String periodo = switch (r.getPeriodicidad() != null ? r.getPeriodicidad() : "") {
        case "POR_HORA" -> "/ hora";
        case "POR_PROYECTO" -> "/ proyecto";
        default -> "/ mes";
    };
    String simbolo = "USD".equals(moneda) ? "$" : "EUR".equals(moneda) ? "€" : "$";
    if (r.getMontoMax() != null) {
        return String.format("%s%,.0f - %s%,.0f %s %s", simbolo, r.getMontoMin(), simbolo, r.getMontoMax(), moneda, periodo);
    }
    return String.format("%s%,.0f %s %s", simbolo, r.getMontoMin(), moneda, periodo);
}

private String formatearRequisitos(List<RequisitoVacante> requisitos) {
    if (requisitos == null || requisitos.isEmpty()) return "";
    return requisitos.stream().map(RequisitoVacante::getDescripcion).collect(Collectors.joining(", "));
}
}