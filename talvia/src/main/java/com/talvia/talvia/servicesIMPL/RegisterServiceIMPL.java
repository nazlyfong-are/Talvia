package com.talvia.talvia.servicesIMPL;

import com.talvia.talvia.dto.CertificacionDTO;
import com.talvia.talvia.dto.ExperienciaDTO;
import com.talvia.talvia.dto.FormacionDTO;
import com.talvia.talvia.dto.HabilidadDTO;
import com.talvia.talvia.dto.RegisterEmpresaDTO;
import com.talvia.talvia.dto.RegisterTrabajadorDTO;
import com.talvia.talvia.model.embedded.Certificacion;
import com.talvia.talvia.model.embedded.ExpLaboral;
import com.talvia.talvia.model.embedded.Formacion;
import com.talvia.talvia.model.embedded.Habilidad;
import com.talvia.talvia.model.enums.NivelEducativo;
import com.talvia.talvia.model.enums.NivelHabilidad;
import com.talvia.talvia.model.enums.Rol;
import com.talvia.talvia.model.enums.TipoDocumento;
import com.talvia.talvia.model.usuario.Empresa;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.repository.AdminRepository;
import com.talvia.talvia.repository.EmpresaRepository;
import com.talvia.talvia.repository.TrabajadorRepository;
import com.talvia.talvia.services.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RegisterServiceIMPL implements RegisterService {

    private final AdminRepository adminRepository;
    @Autowired private TrabajadorRepository trabajadorRepository;
    @Autowired private EmpresaRepository empresaRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    RegisterServiceIMPL(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public void registerTrabajador(RegisterTrabajadorDTO dto) {

        if (trabajadorRepository.existsByEmail(dto.getCorreoElectronico())
                || empresaRepository.existsByEmail(dto.getCorreoElectronico())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo electrónico.");
        }

        TipoDocumento tipoDocumento;
        try{
            tipoDocumento = TipoDocumento.valueOf(dto.getTipoDocumento());
        } catch (IllegalArgumentException | NullPointerException e){
            throw new IllegalArgumentException("Tipo de documento inválido.");
        }
        Trabajador trabajador = new Trabajador();

        // ── Datos obligatorios ──
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

        // ── Información profesional (opcional) ──
        trabajador.setEspecilidad(dto.getEspecialidad());
        trabajador.setResumenProfesional(dto.getResumenProfesional());
        trabajador.setCiudad(dto.getCiudad());
        trabajador.setAniosExpTotal(dto.getAniosExperienciaTotal());

        List<Habilidad> habilidades = new ArrayList<>();
        if(dto.getHabilidades() != null){
            for (HabilidadDTO h : dto.getHabilidades()){
                if(h.getNombre() == null || h.getNombre().isBlank()) continue;
                Habilidad habilidad = new Habilidad();
                habilidad.setNombre(h.getNombre());
                habilidad.setCategoria(h.getCategoria());
                try{
                    habilidad.setNivel(h.getNivel() != null ? NivelHabilidad.valueOf(h.getNivel()) : null);
                } catch (IllegalArgumentException ignored){
                    //si viene un nivel invalido, simplemente se deja en null en lugar de romper el registro
                }
                habilidades.add(habilidad);
            }
        }
        trabajador.setHabilidades(habilidades);
        
        List<Formacion> formaciones = new ArrayList<>();
        if(dto.getFormaciones() != null){
            for (FormacionDTO f : dto.getFormaciones()){
                if(f.getInstitucion() == null || f.getInstitucion().isBlank()) continue;
                Formacion formacion = new Formacion();
                formacion.setInstituto(f.getInstitucion());
                formacion.setTitulo(f.getTitulo());

                try {
                    formacion.setNivel(f.getNivel() != null ? NivelEducativo.valueOf(f.getNivel()) : null);
                } catch (IllegalArgumentException ignored){}
                 formacion.setFechaInicio(parseFecha(f.getFechaInicio()));
                formacion.setFechaFin(parseFecha(f.getFechaFin()));
                formacion.setEnCurso(f.isEnCurso());
                formacion.setTrabajador(trabajador); // back-reference obligatoria
                formaciones.add(formacion);
            }
        }
        trabajador.setFormaciones(formaciones);

        // ── Experiencias (entidades propias, necesitan back-reference) ──
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

        // ── Certificaciones (entidades propias, necesitan back-reference) ──
        List<Certificacion> certificaciones = new ArrayList<>();
        if (dto.getCertificaciones() != null) {
            for (CertificacionDTO c : dto.getCertificaciones()) {
                if (c.getNombre() == null || c.getNombre().isBlank()) continue;
                Certificacion certificacion = new Certificacion();
                certificacion.setNombre(c.getNombre());
                certificacion.setEntidadEmisora(c.getEntidadEmisora());
                certificacion.setFechaObtencion(parseFecha(c.getFechaObtencion()));
                certificacion.setFechaVencimiento(parseFecha(c.getFechaVencimiento()));
                certificacion.setTrabajador(trabajador);
                certificaciones.add(certificacion);
            }
        }
        trabajador.setCertificaciones(certificaciones);

        // Gracias a cascade = CascadeType.ALL en las relaciones @OneToMany del Trabajador,
        // un solo save() guarda el trabajador Y todas sus listas asociadas.
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

    // Convierte "yyyy-MM-dd" (formato del <input type="date">) a LocalDate, o null si viene vacío
    private LocalDate parseFecha(String fecha) {
        if (fecha == null || fecha.isBlank()) return null;
        try {
            return LocalDate.parse(fecha);
        } catch (Exception e) {
            return null; // fecha mal formada, se ignora en vez de romper el registro
        }
    }
}