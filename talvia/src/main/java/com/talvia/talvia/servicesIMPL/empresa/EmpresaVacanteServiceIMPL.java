package com.talvia.talvia.servicesIMPL.empresa;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.vacante.RequisitoVacante;
import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.enums.NivelEducativo;
import com.talvia.talvia.model.enums.TipoNotificacion;
import com.talvia.talvia.model.usuario.Empresa;
import com.talvia.talvia.model.vacante.Vacante;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talvia.talvia.dto.request.empresa.VacanteCreateDTO;
import com.talvia.talvia.dto.response.empresa.VacanteDetalleEdicionDTO;
import com.talvia.talvia.dto.response.vacante.VacantesResponseDTO;
import com.talvia.talvia.repository.usuario.EmpresaRepository;
import com.talvia.talvia.repository.vacante.VacanteRepository;
import com.talvia.talvia.services.empresa.EmpresaVacanteService;
import com.talvia.talvia.services.notificacion.NotificacionService;
import com.talvia.talvia.services.vacante.VacanteService;

@Service
public class EmpresaVacanteServiceIMPL implements EmpresaVacanteService{

    @Autowired private VacanteRepository vacanteRepository;
    @Autowired private EmpresaRepository empresaRepository;
    @Autowired private VacanteService vacanteService;
    @Autowired private NotificacionService notificacionService;

    @Override
    public List<VacantesResponseDTO> listarPropias(Long empresaId) {
        return vacanteRepository.findByEmpresaId(empresaId)
                .stream().map(vacanteService::toDTO).collect(Collectors.toList());
    }

    @Override
    public VacantesResponseDTO crear(Long empresaId, VacanteCreateDTO dto) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        Vacante vacante = new Vacante();
        vacante.setEmpresa(empresa);
        vacante.setEstado(EstadoVacante.ABIERTA);
        vacante.setFechaPublicacion(LocalDateTime.now());

        aplicarDatos(vacante, dto);

        Vacante vacanteGuardada = vacanteRepository.save(vacante);

        notificacionService.crear(empresa, TipoNotificacion.VACANTE_PUBLICADA,
                "Tu vacante \"" + vacanteGuardada.getTitulo() + "\" ya está publicada.",
                "/private/empresa/dashboard");

        return vacanteService.toDTO(vacanteGuardada);
    }

    @Override
    public VacanteDetalleEdicionDTO obtenerPropiaParaEditar(Long empresaId, Long vacanteId) {
        Vacante vacante = obtenerVerificando(empresaId, vacanteId);

        VacanteDetalleEdicionDTO dto = new VacanteDetalleEdicionDTO();
        dto.setId(vacante.getId());
        dto.setTitulo(vacante.getTitulo());
        dto.setUbicacion(vacante.getUbicacion());
        dto.setArea(vacante.getArea());
        dto.setExpMinimaAnios(vacante.getExpMinimaAnios());
        dto.setModalidad(vacante.getModalidad());
        dto.setNivelCargo(vacante.getNivelCargo());
        dto.setDescripcion(vacante.getDescripcion());
        dto.setBeneficios(vacante.getBeneficios());
        dto.setEstado(vacante.getEstado() != null ? vacante.getEstado().name() : null);

        RangoSalarial presupuesto = vacante.getPresupuesto();
        if (presupuesto != null) {
            dto.setMontoMinimo(presupuesto.getMontoMin() != null ? presupuesto.getMontoMin().doubleValue() : null);
            dto.setMontoMaximo(presupuesto.getMontoMax() != null ? presupuesto.getMontoMax().doubleValue() : null);
            dto.setMoneda(presupuesto.getMoneda());
            dto.setPeriodicidad(presupuesto.getPeriodicidad());
        }

        dto.setNivelEducativoMinimo(vacante.getNivelEducativoMinimo() != null ? vacante.getNivelEducativoMinimo().name() : null);

        List<String> requisitosTexto = vacante.getRequisitos() != null
                ? vacante.getRequisitos().stream().map(RequisitoVacante::getDescripcion).collect(Collectors.toList())
                : new ArrayList<>();
        dto.setRequisitos(requisitosTexto);

        return dto;
    }

    @Override
    public VacantesResponseDTO actualizar(Long empresaId, Long vacanteId, VacanteCreateDTO dto) {
        Vacante vacante = obtenerVerificando(empresaId, vacanteId);
        aplicarDatos(vacante, dto);
        return vacanteService.toDTO(vacanteRepository.save(vacante));
    }

    @Override
    public VacantesResponseDTO cambiarEstado(Long empresaId, Long vacanteId, String nuevoEstado) {
        Vacante vacante = obtenerVerificando(empresaId, vacanteId);

        EstadoVacante estado;
        try {
            estado = EstadoVacante.valueOf(nuevoEstado);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estado inválido.");
        }

        vacante.setEstado(estado);
        return vacanteService.toDTO(vacanteRepository.save(vacante));
    }

    @Override
    public void eliminar(Long empresaId, Long vacanteId) {
        Vacante vacante = obtenerVerificando(empresaId, vacanteId);
        vacanteRepository.delete(vacante);
    }

    /* ================= Helpers privados ================= */

    private Vacante obtenerVerificando(Long empresaId, Long vacanteId) {
        Vacante vacante = vacanteRepository.findById(vacanteId)
                .orElseThrow(() -> new IllegalArgumentException("Vacante no encontrada."));

        if (vacante.getEmpresa() == null || !vacante.getEmpresa().getId().equals(empresaId)) {
            throw new IllegalArgumentException("Esa vacante no pertenece a tu empresa.");
        }
        return vacante;
    }

    private void aplicarDatos(Vacante vacante, VacanteCreateDTO dto) {
        vacante.setTitulo(dto.getTitulo());
        vacante.setUbicacion(dto.getUbicacion());
        vacante.setArea(dto.getArea());
        vacante.setExpMinimaAnios(dto.getExpMinimaAnios());
        vacante.setModalidad(dto.getModalidad());
        vacante.setNivelCargo(dto.getNivelCargo());
        vacante.setDescripcion(dto.getDescripcion());
        vacante.setBeneficios(dto.getBeneficios());

        RangoSalarial presupuesto = vacante.getPresupuesto() != null ? vacante.getPresupuesto() : new RangoSalarial();
        if (dto.getMontoMinimo() != null) presupuesto.setMontoMin(BigDecimal.valueOf(dto.getMontoMinimo()));
        if (dto.getMontoMaximo() != null) presupuesto.setMontoMax(BigDecimal.valueOf(dto.getMontoMaximo()));
        else presupuesto.setMontoMax(null);
        presupuesto.setMoneda(dto.getMoneda());
        presupuesto.setPeriodicidad(dto.getPeriodicidad());
        vacante.setPresupuesto(presupuesto);

        List<RequisitoVacante> requisitos = new ArrayList<>();
        if (dto.getRequisitos() != null) {
            for (String texto : dto.getRequisitos()) {
                if (texto == null || texto.isBlank()) continue;
                RequisitoVacante r = new RequisitoVacante();
                r.setDescripcion(texto.trim());
                r.setObligatorio(true);
                requisitos.add(r);
            }
        }
        vacante.setRequisitos(requisitos);

        if (dto.getNivelEducativoMinimo() != null && !dto.getNivelEducativoMinimo().isBlank()) {
            try {
                vacante.setNivelEducativoMinimo(NivelEducativo.valueOf(dto.getNivelEducativoMinimo()));
            } catch (IllegalArgumentException ignored) {
                vacante.setNivelEducativoMinimo(null);
            }
        } else {
            vacante.setNivelEducativoMinimo(null);
        }
    }
}