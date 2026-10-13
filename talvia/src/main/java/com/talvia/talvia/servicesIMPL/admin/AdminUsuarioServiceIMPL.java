package com.talvia.talvia.servicesIMPL.admin;

import com.talvia.talvia.dto.response.admin.AdminUsuarioDTO;
import com.talvia.talvia.dto.response.comunes.PaginaDTO;
import com.talvia.talvia.model.enums.Rol;
import com.talvia.talvia.model.usuario.Empresa;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.usuario.Usuario;
import com.talvia.talvia.repository.usuario.UsuarioRepository;
import com.talvia.talvia.services.admin.AdminUsuarioService;

import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUsuarioServiceIMPL implements AdminUsuarioService {

    private static final int TAMANO_PAGINA = 15;
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired private UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginaDTO<AdminUsuarioDTO> listar(String rol, String activo, String q, int pagina) {

        Rol rolFiltro = null;
        if (rol != null && !rol.isBlank()) {
            try {
                rolFiltro = Rol.valueOf(rol);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Rol inválido.");
            }
            if (rolFiltro == Rol.ADMIN) {
                throw new IllegalArgumentException("Rol inválido.");
            }
        }

        Boolean activoFiltro = null;
        if ("true".equalsIgnoreCase(activo)) activoFiltro = true;
        else if ("false".equalsIgnoreCase(activo)) activoFiltro = false;

        String texto = (q != null && !q.isBlank()) ? q.trim().toLowerCase() : null;

        final Rol rolFinal = rolFiltro;
        final Boolean activoFinal = activoFiltro;

        Specification<Usuario> spec = (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();

            // El panel lista trabajadores y empresas: los admins nunca aparecen
            if (rolFinal != null) {
                condiciones.add(cb.equal(root.get("rol"), rolFinal));
            } else {
                condiciones.add(cb.notEqual(root.get("rol"), Rol.ADMIN));
            }

            if (activoFinal != null) {
                condiciones.add(cb.equal(root.get("activo"), activoFinal));
            }

            if (texto != null) {
                String patron = "%" + texto + "%";
                condiciones.add(cb.or(
                        cb.like(cb.lower(root.<String>get("nombre")), patron),
                        cb.like(cb.lower(root.<String>get("email")), patron)
                ));
            }

            return cb.and(condiciones.toArray(new Predicate[0]));
        };

        int paginaBase0 = Math.max(pagina, 1) - 1;
        PageRequest pageable = PageRequest.of(paginaBase0, TAMANO_PAGINA,
                Sort.by(Sort.Direction.DESC, "fechaRegistro"));

        Page<Usuario> resultado = usuarioRepository.findAll(spec, pageable);

        List<AdminUsuarioDTO> contenido = resultado.getContent().stream()
                .map(u -> toDTO(u, false))
                .collect(Collectors.toList());

        return new PaginaDTO<>(contenido, paginaBase0 + 1, Math.max(resultado.getTotalPages(), 1),
                resultado.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUsuarioDTO obtener(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));
        return toDTO(u, true);
    }

    @Override
    @Transactional
    public AdminUsuarioDTO cambiarEstado(Long id, boolean activo) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        if (u.getRol() == Rol.ADMIN) {
            throw new IllegalArgumentException("No se puede modificar una cuenta de administrador.");
        }

        u.setActivo(activo);
        return toDTO(usuarioRepository.save(u), false);
    }

    private AdminUsuarioDTO toDTO(Usuario u, boolean incluirTelefono) {
        String nombre = u.getNombre();
        String ciudad = null;

        if (u instanceof Trabajador t) {
            nombre = (t.getNombre() + " " + (t.getPrimerApellido() != null ? t.getPrimerApellido() : "")).trim();
            ciudad = t.getCiudad();
        } else if (u instanceof Empresa e) {
            if (e.getRazonSocial() != null && !e.getRazonSocial().isBlank()) {
                nombre = e.getRazonSocial();
            }
            ciudad = e.getCiudad();
        }

        return new AdminUsuarioDTO(
                u.getId(),
                nombre,
                u.getEmail(),
                u.getRol() != null ? u.getRol().name() : null,
                ciudad,
                incluirTelefono ? u.getTelefono() : null,
                u.getFechaRegistro() != null ? u.getFechaRegistro().toLocalDate().format(FORMATO_FECHA) : null,
                u.isActivo()
        );
    }
}