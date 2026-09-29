package com.talvia.talvia.servicesIMPL.admin;

import com.talvia.talvia.dto.response.admin.AdminPostulacionDTO;
import com.talvia.talvia.dto.response.comunes.PaginaDTO;
import com.talvia.talvia.model.enums.EstadoPostulacion;
import com.talvia.talvia.model.proceso.Postulacion;
import com.talvia.talvia.repository.proceso.PostulacionRepository;
import com.talvia.talvia.services.admin.AdminPostulacionService;

import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminPostulacionServiceIMPL implements AdminPostulacionService {

    private static final int TAMANO_PAGINA = 15;
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private PostulacionRepository postulacionRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginaDTO<AdminPostulacionDTO> listar(String estado, LocalDate desde, LocalDate hasta, int pagina) {

        EstadoPostulacion estadoEnum = null;
        if (estado != null && !estado.isBlank()) {
            try {
                estadoEnum = EstadoPostulacion.valueOf(estado);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Estado inválido.");
            }
        }

        LocalDateTime desdeDt = desde != null ? desde.atStartOfDay() : null;
        // "hasta" es inclusivo: se usa el inicio del día siguiente como límite exclusivo
        LocalDateTime hastaDt = hasta != null ? hasta.plusDays(1).atStartOfDay() : null;

        final EstadoPostulacion estadoFinal = estadoEnum;

        Specification<Postulacion> spec = (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();
            if (estadoFinal != null) {
                condiciones.add(cb.equal(root.get("estado"), estadoFinal));
            }
            if (desdeDt != null) {
                condiciones.add(cb.greaterThanOrEqualTo(root.get("fechaPostulacion"), desdeDt));
            }
            if (hastaDt != null) {
                condiciones.add(cb.lessThan(root.get("fechaPostulacion"), hastaDt));
            }
            return cb.and(condiciones.toArray(new Predicate[0]));
        };

        int paginaBase0 = Math.max(pagina, 1) - 1;
        PageRequest pageable = PageRequest.of(paginaBase0, TAMANO_PAGINA,
                Sort.by(Sort.Direction.DESC, "fechaPostulacion"));

        Page<Postulacion> resultado = postulacionRepository.findAll(spec, pageable);

        List<AdminPostulacionDTO> contenido = resultado.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new PaginaDTO<>(contenido, paginaBase0 + 1, Math.max(resultado.getTotalPages(), 1),
                resultado.getTotalElements());
    }

    private AdminPostulacionDTO toDTO(Postulacion p) {
        String nombre = (p.getTrabajador().getNombre() + " " +
                (p.getTrabajador().getPrimerApellido() != null ? p.getTrabajador().getPrimerApellido() : "")).trim();

        return new AdminPostulacionDTO(
                p.getId(),
                nombre,
                p.getVacante().getTitulo(),
                p.getVacante().getEmpresa().getRazonSocial(),
                p.getFechaPostulacion() != null ? p.getFechaPostulacion().toLocalDate().format(FORMATO_FECHA) : null,
                p.getFechaVista() != null ? p.getFechaVista().toLocalDate().format(FORMATO_FECHA) : null,
                p.getEstado() != null ? p.getEstado().name() : null
        );
    }
}