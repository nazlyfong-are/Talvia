package com.talvia.talvia.servicesIMPL.trabajador;

import com.talvia.talvia.dto.request.comunes.CloudinaryUploadResultDTO;
import com.talvia.talvia.dto.request.comunes.HabilidadDTO;
import com.talvia.talvia.dto.request.trabajador.CertificacionUpdateDTO;
import com.talvia.talvia.dto.request.trabajador.ExperienciaUpdateDTO;
import com.talvia.talvia.dto.request.trabajador.FormacionUpdateDTO;
import com.talvia.talvia.dto.request.trabajador.TrabajadorPerfilUpdateDTO;
import com.talvia.talvia.dto.response.trabajador.CertificacionResponseDTO;
import com.talvia.talvia.dto.response.trabajador.CvDocumentoResponseDTO;
import com.talvia.talvia.dto.response.trabajador.ExperienciaResponseDTO;
import com.talvia.talvia.dto.response.trabajador.FormacionResponsiveDTO;
import com.talvia.talvia.dto.response.trabajador.TrabajadorPerfilResponseDTO;
import com.talvia.talvia.model.embedded.Certificacion;
import com.talvia.talvia.model.embedded.CvDocumento;
import com.talvia.talvia.model.embedded.ExpLaboral;
import com.talvia.talvia.model.embedded.Formacion;
import com.talvia.talvia.model.embedded.Habilidad;
import com.talvia.talvia.model.embedded.ImagenCloudinary;
import com.talvia.talvia.model.enums.NivelEducativo;
import com.talvia.talvia.model.enums.NivelHabilidad;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.repository.proceso.PostulacionRepository;
import com.talvia.talvia.repository.usuario.TrabajadorRepository;
import com.talvia.talvia.services.soporte.CloudinaryService;
import com.talvia.talvia.services.trabajador.TrabajadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class TrabajadorServiceIMPL implements TrabajadorService {

    private static final int MAX_CVS = 4;
    private static final long CACHE_DURACION_MS = 2 * 60 * 1000; // 2 minutos

    @Autowired private TrabajadorRepository trabajadorRepository;
    @Autowired private CloudinaryService cloudinaryService;
    @Autowired private PostulacionRepository postulacionRepository;

    /* ================= Caché en memoria del perfil ================= */

    private final ConcurrentHashMap<Long, CacheEntry> cachePerfiles = new ConcurrentHashMap<>();

    private static class CacheEntry {
        TrabajadorPerfilResponseDTO dto;
        long timestamp;
    }

    private void invalidarCache(Long trabajadorId) {
        cachePerfiles.remove(trabajadorId);
    }

    @Override
    @Transactional(readOnly = true)
    public TrabajadorPerfilResponseDTO obtenerPerfil(Long trabajadorId) {
        CacheEntry cacheado = cachePerfiles.get(trabajadorId);
        if (cacheado != null && (System.currentTimeMillis() - cacheado.timestamp) < CACHE_DURACION_MS) {
            return cacheado.dto; // Respuesta instantánea, sin tocar la base de datos
        }

        Trabajador t = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));
        TrabajadorPerfilResponseDTO dto = toResponseDTO(t);

        CacheEntry nuevoCache = new CacheEntry();
        nuevoCache.dto = dto;
        nuevoCache.timestamp = System.currentTimeMillis();
        cachePerfiles.put(trabajadorId, nuevoCache);

        return dto;
    }

    @Override
    @Transactional
    public TrabajadorPerfilResponseDTO actualizarPerfil(Long trabajadorId, TrabajadorPerfilUpdateDTO dto) {
        Trabajador t = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));

        if (dto.getNombres() != null)
            t.setNombre(dto.getNombres());
        if (dto.getPrimerApellido() != null)
            t.setPrimerApellido(dto.getPrimerApellido());
        if (dto.getSegundoApellido() != null)
            t.setSegundoApellido(dto.getSegundoApellido());
        if (dto.getTelefono() != null)
            t.setTelefono(dto.getTelefono());
        if (dto.getCiudad() != null)
            t.setCiudad(dto.getCiudad());
        if (dto.getEspecialidad() != null)
            t.setEspecilidad(dto.getEspecialidad());
        if (dto.getAnosExperienciaTotal() != null)
            t.setAnosExperienciaTotal(dto.getAnosExperienciaTotal());
        if (dto.getDisponibleInmediato() != null)
            t.setDisponibleInmediato(dto.getDisponibleInmediato());

        // Preferencias y apoyos: null = la sección no vino en la petición y no se toca nada.
        // Si la validación falla, se lanza IllegalArgumentException y la transacción se revierte completa.
        if (dto.getApoyos() != null) {
            t.aplicarApoyos(dto.getApoyos(), dto.getApoyosNota(),
                    Boolean.TRUE.equals(dto.getAutorizaTratamientoApoyos()));
        }

        actualizarFormaciones(t, dto.getFormaciones());
        actualizarExperiencias(t, dto.getExperiencias());
        actualizarCertificaciones(t, dto.getCertificaciones());
        actualizarHabilidades(t, dto.getHabilidadesTecnicas(), dto.getIdiomas());

        TrabajadorPerfilResponseDTO resultado = toResponseDTO(trabajadorRepository.save(t));
        invalidarCache(trabajadorId);
        return resultado;
    }

    @Override
    @Transactional
    public String actualizarFoto(Long trabajadorId, MultipartFile archivo) throws Exception {
        Trabajador t = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));

        if (t.getFoto() != null && t.getFoto().getPublicId() != null) {
            cloudinaryService.eliminar(t.getFoto().getPublicId());
        }

        CloudinaryUploadResultDTO resultado = cloudinaryService.subir(archivo, "talvia/fotos_perfil");

        ImagenCloudinary foto = new ImagenCloudinary();
        foto.setUrl(resultado.getUrl());
        foto.setPublicId(resultado.getPublicId());
        foto.setFechaSubida(LocalDateTime.now());
        t.setFoto(foto);

        trabajadorRepository.save(t);
        invalidarCache(trabajadorId);
        return resultado.getUrl();
    }

    /* ================= CVs (hasta 4) ================= */

    @Override
    @Transactional(readOnly = true)
    public List<CvDocumentoResponseDTO> listarCvs(Long trabajadorId) {
        Trabajador t = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));
        return t.getCvs().stream().map(this::toCvDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CvDocumentoResponseDTO subirCv(Long trabajadorId, String nombre, MultipartFile archivo) throws Exception {
        Trabajador t = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));

        if (t.getCvs().size() >= MAX_CVS) {
            throw new IllegalArgumentException(
                    "Ya tienes el máximo de " + MAX_CVS + " hojas de vida. Elimina una para subir otra.");
        }

        CloudinaryUploadResultDTO resultado = cloudinaryService.subir(archivo, "talvia/cv_completos");

        CvDocumento cv = new CvDocumento();
        cv.setNombre(nombre != null && !nombre.isBlank() ? nombre : "Hoja de vida " + (t.getCvs().size() + 1));
        cv.setUrl(resultado.getUrl());
        cv.setPublicId(resultado.getPublicId());
        cv.setFechaSubida(LocalDateTime.now());
        cv.setTrabajador(t);

        t.getCvs().add(cv);
        trabajadorRepository.save(t);
        invalidarCache(trabajadorId);

        return toCvDTO(cv);
    }

    @Override
    @Transactional
    public void eliminarCv(Long trabajadorId, Long cvId) throws Exception {
        Trabajador t = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));

        CvDocumento cv = t.getCvs().stream()
                .filter(c -> c.getId().equals(cvId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Ese CV no pertenece a este trabajador."));

        if (postulacionRepository.existsByCvEnviadoId(cvId)) {
            throw new IllegalArgumentException(
                    "No puedes eliminar este CV porque ya fue enviado en una postulación. " +
                    "Sube uno nuevo si quieres reemplazarlo.");
        }

        if (cv.getPublicId() != null) {
            cloudinaryService.eliminar(cv.getPublicId());
        }

        t.getCvs().remove(cv);
        trabajadorRepository.save(t);
        invalidarCache(trabajadorId);
    }

    private CvDocumentoResponseDTO toCvDTO(CvDocumento cv) {
        return new CvDocumentoResponseDTO(
                cv.getId(), cv.getNombre(), cv.getUrl(),
                cv.getFechaSubida() != null ? cv.getFechaSubida().toString() : null);
    }

    /* ================= Documentos de formación / certificación ================= */

    @Override
    @Transactional
    public String adjuntarDocumentoFormacion(Long trabajadorId, Long formacionId, MultipartFile archivo)
            throws Exception {
        Trabajador t = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));

        Formacion formacion = t.getFormaciones().stream()
                .filter(f -> f.getId().equals(formacionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Esa formación no pertenece a este trabajador."));

        if (formacion.getDocumentoPublicId() != null) {
            cloudinaryService.eliminar(formacion.getDocumentoPublicId());
        }

        CloudinaryUploadResultDTO resultado = cloudinaryService.subir(archivo, "talvia/titulos_academicos");
        formacion.setDocumentoUrl(resultado.getUrl());
        formacion.setDocumentoPublicId(resultado.getPublicId());

        trabajadorRepository.save(t);
        invalidarCache(trabajadorId);
        return resultado.getUrl();
    }

    @Override
    @Transactional
    public void eliminarDocumentoFormacion(Long trabajadorId, Long formacionId) throws Exception {
        Trabajador t = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));

        Formacion formacion = t.getFormaciones().stream()
                .filter(f -> f.getId().equals(formacionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Esa formación no pertenece a este trabajador."));

        if (formacion.getDocumentoPublicId() != null) {
            cloudinaryService.eliminar(formacion.getDocumentoPublicId());
        }
        formacion.setDocumentoUrl(null);
        formacion.setDocumentoPublicId(null);
        trabajadorRepository.save(t);
        invalidarCache(trabajadorId);
    }

    @Override
    @Transactional
    public String adjuntarDocumentoCertificacion(Long trabajadorId, Long certificacionId, MultipartFile archivo)
            throws Exception {
        Trabajador t = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado."));

        Certificacion cert = t.getCertificaciones().stream()
                .filter(c -> c.getId().equals(certificacionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Esa certificación no pertenece a este trabajador."));

        if (cert.getDocumentoPublicId() != null) {
            cloudinaryService.eliminar(cert.getDocumentoPublicId());
        }

        CloudinaryUploadResultDTO resultado = cloudinaryService.subir(archivo, "talvia/certificaciones");
        cert.setDocumentoUrl(resultado.getUrl());
        cert.setDocumentoPublicId(resultado.getPublicId());

        trabajadorRepository.save(t);
        invalidarCache(trabajadorId);
        return resultado.getUrl();
    }

    /* ================= Helpers privados ================= */

    private void actualizarFormaciones(Trabajador t, List<FormacionUpdateDTO> nuevas) {
        if (nuevas == null)
            return;
        List<Formacion> actuales = t.getFormaciones();
        actuales.removeIf(actual -> nuevas.stream().noneMatch(n -> actual.getId().equals(n.getId())));

        for (FormacionUpdateDTO dto : nuevas) {
            if (dto.getInstitucion() == null || dto.getInstitucion().isBlank())
                continue;

            Formacion formacion = dto.getId() != null
                    ? actuales.stream().filter(f -> f.getId().equals(dto.getId())).findFirst().orElse(null)
                    : null;

            if (formacion == null) {
                formacion = new Formacion();
                formacion.setTrabajador(t);
                actuales.add(formacion);
            }

            formacion.setInstituto(dto.getInstitucion());
            formacion.setTitulo(dto.getTitulo());
            try {
                formacion.setNivel(dto.getNivel() != null && !dto.getNivel().isBlank()
                        ? NivelEducativo.valueOf(dto.getNivel())
                        : null);
            } catch (IllegalArgumentException ignored) {
            }
            formacion.setFechaInicio(parseFecha(dto.getFechaInicio()));
            formacion.setFechaFin(parseFecha(dto.getFechaFin()));
            formacion.setEnCurso(dto.isEnCurso());
        }
    }

    private void actualizarExperiencias(Trabajador t, List<ExperienciaUpdateDTO> nuevas) {
        if (nuevas == null)
            return;
        List<ExpLaboral> actuales = t.getExperiencias();
        actuales.removeIf(actual -> nuevas.stream().noneMatch(n -> actual.getId().equals(n.getId())));

        for (ExperienciaUpdateDTO dto : nuevas) {
            if (dto.getEmpresaNombre() == null || dto.getEmpresaNombre().isBlank())
                continue;

            ExpLaboral experiencia = dto.getId() != null
                    ? actuales.stream().filter(e -> e.getId().equals(dto.getId())).findFirst().orElse(null)
                    : null;

            if (experiencia == null) {
                experiencia = new ExpLaboral();
                experiencia.setTrabajador(t);
                actuales.add(experiencia);
            }

            experiencia.setEmpresaNombre(dto.getEmpresaNombre());
            experiencia.setCargo(dto.getCargo());
            experiencia.setFechaInicio(parseFecha(dto.getFechaInicio()));
            experiencia.setFechaFin(parseFecha(dto.getFechaFin()));
            experiencia.setDescripcion(dto.getDescripcion());
            experiencia.setTrabajoActual(dto.isTrabajoActual());
        }
    }

    private void actualizarCertificaciones(Trabajador t, List<CertificacionUpdateDTO> nuevas) {
        if (nuevas == null)
            return;
        List<Certificacion> actuales = t.getCertificaciones();
        actuales.removeIf(actual -> nuevas.stream().noneMatch(n -> actual.getId().equals(n.getId())));

        for (CertificacionUpdateDTO dto : nuevas) {
            if (dto.getNombre() == null || dto.getNombre().isBlank())
                continue;

            Certificacion cert = dto.getId() != null
                    ? actuales.stream().filter(c -> c.getId().equals(dto.getId())).findFirst().orElse(null)
                    : null;

            if (cert == null) {
                cert = new Certificacion();
                cert.setTrabajador(t);
                actuales.add(cert);
            }

            cert.setNombre(dto.getNombre());
            cert.setEntidadEmisora(dto.getEntidadEmisora());
            cert.setFechaObtencion(parseFecha(dto.getFechaObtencion()));
            cert.setFechaVencimiento(parseFecha(dto.getFechaVencimiento()));
        }
    }

    private void actualizarHabilidades(Trabajador t, List<HabilidadDTO> tecnicas, List<HabilidadDTO> idiomas) {
        List<Habilidad> nuevaLista = new ArrayList<>();
        if (tecnicas != null) {
            for (HabilidadDTO h : tecnicas) {
                if (h.getNombre() == null || h.getNombre().isBlank())
                    continue;
                nuevaLista.add(mapearHabilidad(h, "Técnica"));
            }
        }
        if (idiomas != null) {
            for (HabilidadDTO h : idiomas) {
                if (h.getNombre() == null || h.getNombre().isBlank())
                    continue;
                nuevaLista.add(mapearHabilidad(h, "Idioma"));
            }
        }
        t.getHabilidades().clear();
        t.getHabilidades().addAll(nuevaLista);
    }

    private Habilidad mapearHabilidad(HabilidadDTO dto, String categoriaPorDefecto) {
        Habilidad h = new Habilidad();
        h.setNombre(dto.getNombre());
        h.setCategoria(
                dto.getCategoria() != null && !dto.getCategoria().isBlank() ? dto.getCategoria() : categoriaPorDefecto);
        try {
            h.setNivel(dto.getNivel() != null && !dto.getNivel().isBlank() ? NivelHabilidad.valueOf(dto.getNivel())
                    : null);
        } catch (IllegalArgumentException ignored) {
        }
        return h;
    }

    private LocalDate parseFecha(String fecha) {
        if (fecha == null || fecha.isBlank())
            return null;
        try {
            return LocalDate.parse(fecha);
        } catch (Exception e) {
            return null;
        }
    }

    private TrabajadorPerfilResponseDTO toResponseDTO(Trabajador t) {
        TrabajadorPerfilResponseDTO dto = new TrabajadorPerfilResponseDTO();
        dto.setId(t.getId());
        dto.setNombres(t.getNombre());
        dto.setPrimerApellido(t.getPrimerApellido());
        dto.setSegundoApellido(t.getSegundoApellido());
        dto.setCorreoElectronico(t.getEmail());
        dto.setTelefono(t.getTelefono());
        dto.setCiudad(t.getCiudad());
        dto.setEspecialidad(t.getEspecilidad());
        dto.setFotoUrl(t.getFoto() != null ? t.getFoto().getUrl() : null);
        dto.setAnosExperienciaTotal(t.getAnosExperienciaTotal());
        dto.setDisponibleInmediato(t.isDisponibleInmediato());
        dto.setCvs(t.getCvs().stream().map(this::toCvDTO).collect(Collectors.toList()));

        dto.setFormaciones(t.getFormaciones().stream().map(f -> new FormacionResponsiveDTO(
                f.getId(), f.getInstituto(), f.getTitulo(),
                f.getNivel() != null ? f.getNivel().name() : null,
                f.getFechaInicio() != null ? f.getFechaInicio().toString() : null,
                f.getFechaFin() != null ? f.getFechaFin().toString() : null,
                f.isEnCurso(), f.getDocumentoUrl())).collect(Collectors.toList()));

        dto.setExperiencias(t.getExperiencias().stream().map(e -> new ExperienciaResponseDTO(
                e.getId(), e.getEmpresaNombre(), e.getCargo(),
                e.getFechaInicio() != null ? e.getFechaInicio().toString() : null,
                e.getFechaFin() != null ? e.getFechaFin().toString() : null,
                e.getDescripcion(), e.isTrabajoActual())).collect(Collectors.toList()));

        dto.setCertificaciones(t.getCertificaciones().stream().map(c -> new CertificacionResponseDTO(
                c.getId(), c.getNombre(), c.getEntidadEmisora(),
                c.getFechaObtencion() != null ? c.getFechaObtencion().toString() : null,
                c.getFechaVencimiento() != null ? c.getFechaVencimiento().toString() : null,
                c.getDocumentoUrl())).collect(Collectors.toList()));

        dto.setHabilidadesTecnicas(t.getHabilidades().stream()
                .filter(h -> !"Idioma".equalsIgnoreCase(h.getCategoria()))
                .map(this::toHabilidadDTO).collect(Collectors.toList()));

        dto.setIdiomas(t.getHabilidades().stream()
                .filter(h -> "Idioma".equalsIgnoreCase(h.getCategoria()))
                .map(this::toHabilidadDTO).collect(Collectors.toList()));

        // Preferencias y apoyos de trabajo (la empresa ve lo mismo al abrir una postulación)
        dto.setApoyos(t.getApoyos().stream().sorted().map(Enum::name).collect(Collectors.toList()));
        dto.setApoyosNota(t.getApoyosNota());

        return dto;
    }

    private HabilidadDTO toHabilidadDTO(Habilidad h) {
        HabilidadDTO hd = new HabilidadDTO();
        hd.setNombre(h.getNombre());
        hd.setNivel(h.getNivel() != null ? h.getNivel().name() : null);
        hd.setCategoria(h.getCategoria());
        return hd;
    }
}