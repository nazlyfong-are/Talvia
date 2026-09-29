package com.talvia.talvia.servicesIMPL.trabajador;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talvia.talvia.dto.request.trabajador.PostulacionCreateDTO;
import com.talvia.talvia.dto.response.empresa.PostulacionDetalleDTO;
import com.talvia.talvia.dto.response.empresa.PostulacionResponseDTO;
import com.talvia.talvia.dto.response.trabajador.PostulacionTrabajadorResponseDTO;
import com.talvia.talvia.dto.response.vacante.VacantesResponseDTO;
import com.talvia.talvia.model.embedded.CvDocumento;
import com.talvia.talvia.model.enums.EstadoPostulacion;
import com.talvia.talvia.model.enums.TipoNotificacion;
import com.talvia.talvia.model.proceso.Postulacion;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.vacante.Vacante;
import com.talvia.talvia.repository.proceso.CvDocumentoRepository;
import com.talvia.talvia.repository.proceso.PostulacionRepository;
import com.talvia.talvia.repository.usuario.TrabajadorRepository;
import com.talvia.talvia.repository.vacante.VacanteRepository;
import com.talvia.talvia.services.notificacion.NotificacionService;
import com.talvia.talvia.services.trabajador.PostulacionService;
import com.talvia.talvia.services.trabajador.TrabajadorService;
import com.talvia.talvia.services.vacante.VacanteService;

import jakarta.transaction.Transactional;

@Service
public class PostulacionServiceIMPL implements PostulacionService {

    @Autowired private PostulacionRepository postulacionRepository;
    @Autowired private TrabajadorRepository trabajadorRepository;
    @Autowired private VacanteRepository vacanteRepository;
    @Autowired private CvDocumentoRepository cvDocumentoRepository;
    @Autowired private TrabajadorService trabajadorService;
    @Autowired private VacanteService vacanteService;
    @Autowired private NotificacionService notificacionService;

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public void postularse(Long trabajadorId, PostulacionCreateDTO dto) {
        if (postulacionRepository.existsByTrabajadorIdAndVacanteId(trabajadorId, dto.getVacanteId())) {
            throw new IllegalArgumentException("Ya te has postulado a esta vacante.");
        }

        if (dto.getCvId() == null) {
            throw new IllegalArgumentException("Debes seleccionar una hoja de vida para enviar.");
        }

        Trabajador trabajador = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));
        Vacante vacante = vacanteRepository.findById(dto.getVacanteId())
                .orElseThrow(() -> new IllegalArgumentException("Vacante no encontrada."));

        CvDocumento cv = cvDocumentoRepository.findById(dto.getCvId())
                .filter(c -> c.getTrabajador().getId().equals(trabajadorId))
                .orElseThrow(() -> new IllegalArgumentException("La hoja de vida seleccionada no es válida."));

        Postulacion postulacion = new Postulacion();
        postulacion.setTrabajador(trabajador);
        postulacion.setVacante(vacante);
        postulacion.setCvEnviado(cv);
        postulacion.setFechaPostulacion(LocalDateTime.now());
        postulacion.setEstado(EstadoPostulacion.PENDIENTE);
        postulacion.setSalarioEsperado(dto.getSalarioEsperado());
        postulacion.setDisponibilidad(dto.getDisponibilidad());
        postulacion.setExperienciaResumen(dto.getExpResumen());

        postulacionRepository.save(postulacion);

        String nombreCandidato = (trabajador.getNombre() + " " +
                (trabajador.getPrimerApellido() != null ? trabajador.getPrimerApellido() : "")).trim();

        // Notificación a la empresa (correo ya se maneja en otro punto si aplica)
        notificacionService.crear(vacante.getEmpresa(), TipoNotificacion.NUEVO_CANDIDATO,
                nombreCandidato + " se postuló a tu vacante \"" + vacante.getTitulo() + "\".",
                "/private/empresa/dashboard");
    }

    @Override
    public boolean yaPostulo(Long trabajadorId, Long vacanteId) {
        return postulacionRepository.existsByTrabajadorIdAndVacanteId(trabajadorId, vacanteId);
    }

    @Override
    public List<PostulacionResponseDTO> listarPorEmpresa(Long empresaId) {
        return postulacionRepository.findByVacante_Empresa_IdOrderByFechaPostulacionDesc(empresaId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<PostulacionTrabajadorResponseDTO> listarPorTrabajador(Long trabajadorId) {
        return postulacionRepository.findByTrabajadorId(trabajadorId).stream()
                .map(this::toTrabajadorDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PostulacionDetalleDTO obtenerDetalle(Long empresaId, Long postulacionId) {
        Postulacion p = postulacionRepository.findById(postulacionId)
                .orElseThrow(() -> new IllegalArgumentException("Postulación no encontrada."));
        verificarPertenece(p, empresaId);

        if (p.getFechaVista() == null) {
            p.setFechaVista(LocalDateTime.now());
            postulacionRepository.save(p);

            notificacionService.crear(p.getTrabajador(), TipoNotificacion.CV_VISTO,
                    p.getVacante().getEmpresa().getRazonSocial() + " vio tu hoja de vida para \"" + p.getVacante().getTitulo() + "\".",
                    "/private/trabajador/postulaciones");
        }

        PostulacionDetalleDTO dto = new PostulacionDetalleDTO();
        dto.setId(p.getId());
        dto.setVacanteTitulo(p.getVacante().getTitulo());
        dto.setFecha(p.getFechaPostulacion() != null ? p.getFechaPostulacion().toLocalDate().format(FORMATO_FECHA) : "");
        dto.setEstado(p.getEstado() != null ? p.getEstado().name() : null);
        dto.setSalarioEsperado(p.getSalarioEsperado());
        dto.setDisponibilidad(p.getDisponibilidad());
        dto.setExperienciaResumen(p.getExperienciaResumen());
        dto.setCvEnviadoNombre(p.getCvEnviado() != null ? p.getCvEnviado().getNombre() : null);
        dto.setCvEnviadoUrl(p.getCvEnviado() != null ? p.getCvEnviado().getUrl() : null);
        dto.setCandidato(trabajadorService.obtenerPerfil(p.getTrabajador().getId()));
        return dto;
    }

    @Override
    public void actualizarEstado(Long empresaId, Long postulacionId, String nuevoEstado) {
        Postulacion p = postulacionRepository.findById(postulacionId)
                .orElseThrow(() -> new IllegalArgumentException("Postulación no encontrada."));
        verificarPertenece(p, empresaId);

        try {
            p.setEstado(EstadoPostulacion.valueOf(nuevoEstado));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estado inválido.");
        }
        postulacionRepository.save(p);

        String razonSocial = p.getVacante().getEmpresa().getRazonSocial();

        TipoNotificacion tipoNotif = switch (nuevoEstado) {
            case "ACEPTADO" -> TipoNotificacion.POSTULACION_ACEPTADA;
            case "RECHAZADO" -> TipoNotificacion.POSTULACION_RECHAZADA;
            case "EN_PROCESO" -> TipoNotificacion.POSTULACION_EN_PROCESO;
            default -> null;
        };

        if (tipoNotif != null) {
            String mensajeNotif = switch (nuevoEstado) {
                case "ACEPTADO" -> razonSocial + " te aceptó para continuar en \"" + p.getVacante().getTitulo() + "\".";
                case "RECHAZADO" -> razonSocial + " no continuará tu proceso para \"" + p.getVacante().getTitulo() + "\".";
                default -> razonSocial + " está revisando tu perfil para \"" + p.getVacante().getTitulo() + "\".";
            };
            notificacionService.crear(p.getTrabajador(), tipoNotif, mensajeNotif, "/private/trabajador/postulaciones");
        }
    }

    private void verificarPertenece(Postulacion p, Long empresaId) {
        if (p.getVacante() == null || p.getVacante().getEmpresa() == null
                || !p.getVacante().getEmpresa().getId().equals(empresaId)) {
            throw new IllegalArgumentException("No autorizado para ver esta postulación.");
        }
    }

    private PostulacionResponseDTO toResponseDTO(Postulacion p) {
        String nombreCompleto = (p.getTrabajador().getNombre() + " " +
                (p.getTrabajador().getPrimerApellido() != null ? p.getTrabajador().getPrimerApellido() : "")).trim();
        return new PostulacionResponseDTO(
                p.getId(), p.getTrabajador().getId(), nombreCompleto, p.getVacante().getTitulo(),
                p.getFechaPostulacion() != null ? p.getFechaPostulacion().toLocalDate().format(FORMATO_FECHA) : "",
                p.getEstado() != null ? p.getEstado().name() : null,
                p.getVacante().getId()
        );
    }

    private PostulacionTrabajadorResponseDTO toTrabajadorDTO(Postulacion p) {
        VacantesResponseDTO v = vacanteService.toDTO(p.getVacante());

        PostulacionTrabajadorResponseDTO dto = new PostulacionTrabajadorResponseDTO();
        dto.setId(p.getId());
        dto.setVacanteId(p.getVacante().getId());
        dto.setTitulo(v.getTitulo());
        dto.setEmpresa(v.getEmpresa());
        dto.setLogoUrl(v.getLogoUrl());
        dto.setUbicacion(v.getUbicacion());
        dto.setSalario(v.getSalario());
        dto.setFechaIso(p.getFechaPostulacion() != null ? p.getFechaPostulacion().toString() : null);
        dto.setFechaTexto(p.getFechaPostulacion() != null ? p.getFechaPostulacion().toLocalDate().format(FORMATO_FECHA) : "");
        dto.setEstado(p.getEstado() != null ? p.getEstado().name() : null);
        dto.setFechaVistaTexto(p.getFechaVista() != null ? p.getFechaVista().toLocalDate().format(FORMATO_FECHA) : null);
        return dto;
    }
}