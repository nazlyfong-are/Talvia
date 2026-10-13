package com.talvia.talvia.servicesIMPL.admin;

import com.talvia.talvia.dto.response.admin.AdminVacanteDTO;
import com.talvia.talvia.dto.response.comunes.PaginaDTO;
import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.vacante.Vacante;
import com.talvia.talvia.repository.proceso.PostulacionRepository;
import com.talvia.talvia.repository.vacante.VacanteFavoritaRespository;
import com.talvia.talvia.repository.vacante.VacanteRepository;
import com.talvia.talvia.services.admin.AdminVacanteService;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import com.talvia.talvia.model.usuario.Empresa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminVacanteServiceIMPL implements AdminVacanteService {

    private static final int TAMANO_PAGINA = 15;
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired private VacanteRepository vacanteRepository;
    @Autowired private PostulacionRepository postulacionRepository;
    @Autowired private VacanteFavoritaRespository favoritaRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginaDTO<AdminVacanteDTO> listar(String estado, String area, String q, int pagina) {

        EstadoVacante estadoFiltro = null;
        if (estado != null && !estado.isBlank()) {
            try {
                estadoFiltro = EstadoVacante.valueOf(estado);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Estado inválido.");
            }
        }

        final EstadoVacante estadoFinal = estadoFiltro;
        final String areaFinal = (area != null && !area.isBlank()) ? area.trim().toLowerCase() : null;
        final String texto = (q != null && !q.isBlank()) ? q.trim().toLowerCase() : null;

        Specification<Vacante> spec = (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();

            if (estadoFinal != null) {
                condiciones.add(cb.equal(root.get("estado"), estadoFinal));
            }
            if (areaFinal != null) {
                condiciones.add(cb.equal(cb.lower(root.<String>get("area")), areaFinal));
            }
            if (texto != null) {
                Join<Vacante, Empresa> empresa = root.join("empresa", JoinType.LEFT);
                String patron = "%" + texto + "%";
                condiciones.add(cb.or(
                        cb.like(cb.lower(root.<String>get("titulo")), patron),
                        cb.like(cb.lower(empresa.<String>get("razonSocial")), patron)
                ));
            }
            return cb.and(condiciones.toArray(new Predicate[0]));
        };

        int paginaBase0 = Math.max(pagina, 1) - 1;
        PageRequest pageable = PageRequest.of(paginaBase0, TAMANO_PAGINA,
                Sort.by(Sort.Direction.DESC, "fechaPublicacion"));

        Page<Vacante> resultado = vacanteRepository.findAll(spec, pageable);

        // Un solo query para contar las postulaciones de todas las vacantes de la página
        Map<Long, Long> conteos = new HashMap<>();
        List<Long> ids = resultado.getContent().stream().map(Vacante::getId).collect(Collectors.toList());
        if (!ids.isEmpty()) {
            for (Object[] fila : postulacionRepository.contarPorVacantes(ids)) {
                conteos.put(((Number) fila[0]).longValue(), ((Number) fila[1]).longValue());
            }
        }

        List<AdminVacanteDTO> contenido = resultado.getContent().stream()
                .map(v -> toDTO(v, conteos.getOrDefault(v.getId(), 0L)))
                .collect(Collectors.toList());

        return new PaginaDTO<>(contenido, paginaBase0 + 1, Math.max(resultado.getTotalPages(), 1),
                resultado.getTotalElements());
    }

    @Override
    @Transactional
    public AdminVacanteDTO cambiarEstado(Long id, String nuevoEstado) {
        Vacante v = vacanteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vacante no encontrada."));

        try {
            v.setEstado(EstadoVacante.valueOf(nuevoEstado));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Estado inválido.");
        }

        Vacante guardada = vacanteRepository.save(v);
        return toDTO(guardada, postulacionRepository.countByVacanteId(id));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Vacante v = vacanteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vacante no encontrada."));

        long postulaciones = postulacionRepository.countByVacanteId(id);
        if (postulaciones > 0) {
            throw new IllegalStateException(
                    "Esta vacante tiene " + postulaciones + " postulación(es) y no se puede eliminar sin perder " +
                    "ese historial. Ciérrala en su lugar para retirarla de la vista de los candidatos.");
        }

        favoritaRepository.deleteByVacanteId(id);
        vacanteRepository.delete(v);
    }

    private AdminVacanteDTO toDTO(Vacante v, long totalPostulaciones) {
        return new AdminVacanteDTO(
                v.getId(),
                v.getTitulo(),
                v.getEmpresa() != null ? v.getEmpresa().getRazonSocial() : null,
                v.getArea(),
                v.getFechaPublicacion() != null ? v.getFechaPublicacion().toLocalDate().format(FORMATO_FECHA) : null,
                totalPostulaciones,
                v.getEstado() != null ? v.getEstado().name() : null
        );
    }
}