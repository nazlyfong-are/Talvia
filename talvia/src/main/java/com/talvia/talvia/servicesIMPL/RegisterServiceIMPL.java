package com.talvia.talvia.servicesIMPL;

import com.talvia.talvia.dto.*;
import com.talvia.talvia.dto.request.CloudinaryUploadResultDTO;
import com.talvia.talvia.dto.request.RegisterEmpresaDTO;
import com.talvia.talvia.dto.request.RegisterTrabajadorDTO;
import com.talvia.talvia.model.embedded.Habilidad;
import com.talvia.talvia.model.enums.NivelEducativo;
import com.talvia.talvia.model.enums.NivelHabilidad;
import com.talvia.talvia.model.enums.Rol;
import com.talvia.talvia.model.enums.TipoDocumento;
import com.talvia.talvia.model.embedded.Certificacion;
import com.talvia.talvia.model.embedded.ExpLaboral;
import com.talvia.talvia.model.embedded.Formacion;
import com.talvia.talvia.model.usuario.Empresa;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.repository.EmpresaRepository;
import com.talvia.talvia.repository.TrabajadorRepository;
import com.talvia.talvia.services.CloudinaryService;
import com.talvia.talvia.services.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RegisterServiceIMPL implements RegisterService {

    @Autowired private TrabajadorRepository trabajadorRepository;
    @Autowired private EmpresaRepository empresaRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private CloudinaryService cloudinaryService;

    @Override
    public void registerTrabajador(RegisterTrabajadorDTO dto, Map<String, MultipartFile> archivos) {

        if (trabajadorRepository.existsByEmail(dto.getCorreoElectronico())
                || empresaRepository.existsByEmail(dto.getCorreoElectronico())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo electrónico.");
        }

        TipoDocumento tipoDocumento;
        try {
            tipoDocumento = TipoDocumento.valueOf(dto.getTipoDocumento());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Tipo de documento inválido.");
        }

        Trabajador trabajador = new Trabajador();
        trabajador.setNombre(dto.getNombres());
        trabajador.setEmail(dto.getCorreoElectronico());
        trabajador.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        trabajador.setTelefono(dto.getNumeroTelefono());
        trabajador.setPrimerApellido(dto.getPrimerApellido());
        trabajador.setSegundoApellido(dto.getSegundoApellido());
        trabajador.setTipoDocumento(tipoDocumento);
        trabajador.setNumeroDocumento(dto.getNumeroDocumento());
        trabajador.setRol(Rol.TRABAJADOR);
        trabajador.setFechaRegistro(LocalDateTime.now());
        trabajador.setActivo(true);

        trabajador.setEspecilidad(dto.getEspecialidad());
        trabajador.setResumenProfesional(dto.getResumenProfesional());
        trabajador.setCiudad(dto.getCiudad());
        trabajador.setAnosExperienciaTotal(dto.getAnosExperienciaTotal());

        // ── Habilidades ──
        List<Habilidad> habilidades = new ArrayList<>();
        if (dto.getHabilidades() != null) {
            for (HabilidadDTO h : dto.getHabilidades()) {
                if (h.getNombre() == null || h.getNombre().isBlank()) continue;
                Habilidad habilidad = new Habilidad();
                habilidad.setNombre(h.getNombre());
                habilidad.setCategoria(h.getCategoria());
                try {
                    habilidad.setNivel(h.getNivel() != null ? NivelHabilidad.valueOf(h.getNivel()) : null);
                } catch (IllegalArgumentException ignored) {}
                habilidades.add(habilidad);
            }
        }
        trabajador.setHabilidades(habilidades);

        // ── Formaciones + documentos adjuntos ──
        List<Formacion> formaciones = new ArrayList<>();
        if (dto.getFormaciones() != null) {
            int index = 0;
            for (FormacionDTO f : dto.getFormaciones()) {
                if (f.getInstitucion() == null || f.getInstitucion().isBlank()) continue;

                Formacion formacion = new Formacion();
                formacion.setInstituto(f.getInstitucion());
                formacion.setTitulo(f.getTitulo());
                try {
                    formacion.setNivel(f.getNivel() != null ? NivelEducativo.valueOf(f.getNivel()) : null);
                } catch (IllegalArgumentException ignored) {}
                formacion.setFechaInicio(parseFecha(f.getFechaInicio()));
                formacion.setFechaFin(parseFecha(f.getFechaFin()));
                formacion.setEnCurso(f.isEnCurso());
                formacion.setTrabajador(trabajador);

                MultipartFile archivo = archivos != null ? archivos.get("formacionDoc_" + index) : null;
                if (archivo != null && !archivo.isEmpty()) {
                    try {
                        CloudinaryUploadResultDTO resultado = cloudinaryService.subir(archivo, "talvia/titulos_academicos");
                        formacion.setDocumentoUrl(resultado.getUrl());
                        formacion.setDocumentoPublicId(resultado.getPublicId());
                    } catch (Exception ignored) {
                        // Si falla la subida, el registro continúa igual — el usuario podrá adjuntarlo después
                    }
                }

                formaciones.add(formacion);
                index++;
            }
        }
        trabajador.setFormaciones(formaciones);

        // ── Experiencias ──
        List<ExpLaboral> experiencias = new ArrayList<>();
        if (dto.getExperiencias() != null) {
            for (ExperienciaDTO e : dto.getExperiencias()) {
                if (e.getEmpresaNombre() == null || e.getEmpresaNombre().isBlank()) continue;
                ExpLaboral experiencia = new ExpLaboral();
                experiencia.setEmpresaNombre(e.getEmpresaNombre());
                experiencia.setCargo(e.getCargo());
                experiencia.setFechaInicio(parseFecha(e.getFechaInicio()));
                experiencia.setFechaFin(parseFecha(e.getFechaFin()));
                experiencia.setDescripcion(e.getDescripcion());
                experiencia.setTrabajoActual(e.isTrabajoActual());
                experiencia.setTrabajador(trabajador);
                experiencias.add(experiencia);
            }
        }
        trabajador.setExperiencias(experiencias);

        // ── Certificaciones + documentos adjuntos ──
        List<Certificacion> certificaciones = new ArrayList<>();
        if (dto.getCertificaciones() != null) {
            int index = 0;
            for (CertificacionDTO c : dto.getCertificaciones()) {
                if (c.getNombre() == null || c.getNombre().isBlank()) continue;

                Certificacion certificacion = new Certificacion();
                certificacion.setNombre(c.getNombre());
                certificacion.setEntidadEmisora(c.getEntidadEmisora());
                certificacion.setFechaObtencion(parseFecha(c.getFechaObtencion()));
                certificacion.setFechaVencimiento(parseFecha(c.getFechaVencimiento()));
                certificacion.setTrabajador(trabajador);

                MultipartFile archivo = archivos != null ? archivos.get("certificacionDoc_" + index) : null;
                if (archivo != null && !archivo.isEmpty()) {
                    try {
                        CloudinaryUploadResultDTO resultado = cloudinaryService.subir(archivo, "talvia/certificaciones");
                        certificacion.setDocumentoUrl(resultado.getUrl());
                        certificacion.setDocumentoPublicId(resultado.getPublicId());
                    } catch (Exception ignored) {}
                }

                certificaciones.add(certificacion);
                index++;
            }
        }
        trabajador.setCertificaciones(certificaciones);

        trabajadorRepository.save(trabajador);
    }

    @Override
    public void registerEmpresa(RegisterEmpresaDTO dto) {
        if (empresaRepository.existsByEmail(dto.getCorreoElectronico())
                || trabajadorRepository.existsByEmail(dto.getCorreoElectronico())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo electrónico.");
        }
        if (empresaRepository.findByNit(dto.getNit()).isPresent()) {
            throw new IllegalArgumentException("Ya existe una empresa registrada con ese NIT.");
        }

        Empresa empresa = new Empresa();
        empresa.setSector(dto.getSector());
        empresa.setNombre(dto.getRazonSocial());
        empresa.setEmail(dto.getCorreoElectronico());
        empresa.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        empresa.setTelefono(dto.getNumeroTelefono());
        empresa.setRazonSocial(dto.getRazonSocial());
        empresa.setFiguraLegal(dto.getFiguraLegal());
        empresa.setNit(dto.getNit());
        empresa.setRol(Rol.EMPRESA);
        empresa.setFechaRegistro(LocalDateTime.now());
        empresa.setActivo(true);

        empresaRepository.save(empresa);
    }

    private LocalDate parseFecha(String fecha) {
        if (fecha == null || fecha.isBlank()) return null;
        try { return LocalDate.parse(fecha); } catch (Exception e) { return null; }
    }
}