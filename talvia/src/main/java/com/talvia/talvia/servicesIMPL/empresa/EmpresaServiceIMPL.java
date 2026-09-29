package com.talvia.talvia.servicesIMPL.empresa;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.talvia.talvia.dto.request.comunes.CloudinaryUploadResultDTO;
import com.talvia.talvia.dto.request.empresa.EmpresaPerfilUpdateDTO;
import com.talvia.talvia.dto.response.EmpresaResponseDTO;
import com.talvia.talvia.dto.response.empresa.EmpresaPerfilResponseDTO;
import com.talvia.talvia.dto.response.empresa.EmpresaPublicaDTO;
import com.talvia.talvia.model.embedded.ImagenCloudinary;
import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.usuario.Empresa;
import com.talvia.talvia.repository.usuario.EmpresaRepository;
import com.talvia.talvia.repository.vacante.VacanteRepository;
import com.talvia.talvia.services.empresa.EmpresaService;
import com.talvia.talvia.services.soporte.CloudinaryService;

@Service
public class EmpresaServiceIMPL implements EmpresaService {

    @Autowired private EmpresaRepository empresaRepository;
    @Autowired private VacanteRepository vacanteRepository;
    @Autowired private CloudinaryService cloudinaryService;

    private static final int MAX_EMPRESAS_DESTACADAS = 5;

    @Override
public List<EmpresaResponseDTO> listarEmpresas() {
    List<Empresa> empresas = empresaRepository.findAll();

    // Un solo query trae el conteo de vacantes activas de TODAS las empresas
    Map<Long, Long> conteos = new HashMap<>();
    for (Object[] fila : vacanteRepository.contarActivasPorEmpresa(EstadoVacante.ABIERTA)) {
        conteos.put(((Number) fila[0]).longValue(), ((Number) fila[1]).longValue());
    }

    List<EmpresaResponseDTO> todas = empresas.stream()
            .map(e -> toDTO(e, conteos.getOrDefault(e.getId(), 0L)))
            .collect(Collectors.toList());

    return seleccionarDestacadas(todas);
}

    private EmpresaResponseDTO toDTO(Empresa e) {
        long vacantesActivas = vacanteRepository.countByEmpresaIdAndEstado(e.getId(), EstadoVacante.ABIERTA);
        String logoUrl = e.getLogo() != null ? e.getLogo().getUrl() : null;

        return new EmpresaResponseDTO(
                e.getId(),
                e.getRazonSocial(),
                e.getSector(),
                e.getDescripcion(),
                e.getCiudad(),
                logoUrl,
                vacantesActivas);
    }

    @Override
    public EmpresaPerfilResponseDTO obtenerPerfil(Long empresaId) {
        Empresa e = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada."));
        return toPerfilDTO(e);
    }

    @Override
    public EmpresaPerfilResponseDTO actualizarPerfil(Long empresaId, EmpresaPerfilUpdateDTO dto) {
        Empresa e = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada."));

        if (dto.getRazonSocial() != null)
            e.setRazonSocial(dto.getRazonSocial());
        if (dto.getCiudad() != null)
            e.setCiudad(dto.getCiudad());
        if (dto.getSector() != null)
            e.setSector(dto.getSector());
        if (dto.getDescripcion() != null)
            e.setDescripcion(dto.getDescripcion());
        if (dto.getSitioWeb() != null)
            e.setSitioWeb(dto.getSitioWeb());
        if (dto.getNumeroEmpleados() != null)
            e.setNumeroEmpleados(dto.getNumeroEmpleados());
        if (dto.getFiguraLegal() != null)
            e.setFiguraLegal(dto.getFiguraLegal());

        return toPerfilDTO(empresaRepository.save(e));
    }

    @Override
    public String actualizarLogo(Long empresaId, MultipartFile archivo) throws Exception {
        Empresa e = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada."));

        if (e.getLogo() != null && e.getLogo().getPublicId() != null) {
            cloudinaryService.eliminar(e.getLogo().getPublicId());
        }

        CloudinaryUploadResultDTO resultado = cloudinaryService.subir(archivo, "talvia/logos_empresa");
        ImagenCloudinary logo = new ImagenCloudinary();
        logo.setUrl(resultado.getUrl());
        logo.setPublicId(resultado.getPublicId());
        logo.setFechaSubida(LocalDateTime.now());
        e.setLogo(logo);

        empresaRepository.save(e);
        return resultado.getUrl();
    }

    @Override
    public EmpresaPublicaDTO obtenerPublica(Long empresaId) {
        Empresa e = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada."));

        EmpresaPublicaDTO dto = new EmpresaPublicaDTO();
        dto.setId(e.getId());
        dto.setRazonSocial(e.getRazonSocial());
        dto.setSector(e.getSector());
        dto.setDescripcion(e.getDescripcion());
        dto.setCiudad(e.getCiudad());
        dto.setSitioWeb(e.getSitioWeb());
        dto.setNumeroEmpleados(e.getNumeroEmpleados());
        dto.setLogoUrl(e.getLogo() != null ? e.getLogo().getUrl() : null);
        return dto;
    }

    private List<EmpresaResponseDTO> seleccionarDestacadas(List<EmpresaResponseDTO> todas) {
        List<EmpresaResponseDTO> ordenadas = todas.stream()
                .sorted((a, b) -> Long.compare(b.getVacantesActivas(), a.getVacantesActivas()))
                .collect(Collectors.toList());

        List<EmpresaResponseDTO> resultado = new ArrayList<>();
        int i = 0;
        while (resultado.size() < MAX_EMPRESAS_DESTACADAS && i < ordenadas.size()) {
            long valorActual = ordenadas.get(i).getVacantesActivas();

            // Agrupa todas las empresas consecutivas con el mismo conteo (están
            // "empatadas" porque la lista ya viene ordenada de mayor a menor)
            List<EmpresaResponseDTO> grupoEmpatado = new ArrayList<>();
            while (i < ordenadas.size() && ordenadas.get(i).getVacantesActivas() == valorActual) {
                grupoEmpatado.add(ordenadas.get(i));
                i++;
            }

            int cuposRestantes = MAX_EMPRESAS_DESTACADAS - resultado.size();

            if (grupoEmpatado.size() <= cuposRestantes) {
                // Caben todas las del grupo sin necesidad de sortear
                resultado.addAll(grupoEmpatado);
            } else {
                // Empate real en el límite del cupo: se sortea quién entra
                Collections.shuffle(grupoEmpatado);
                resultado.addAll(grupoEmpatado.subList(0, cuposRestantes));
            }
        }

        return resultado;
    }

    private EmpresaPerfilResponseDTO toPerfilDTO(Empresa e) {
        EmpresaPerfilResponseDTO dto = new EmpresaPerfilResponseDTO();
        dto.setId(e.getId());
        dto.setRazonSocial(e.getRazonSocial());
        dto.setCorreoElectronico(e.getEmail());
        dto.setTelefono(e.getTelefono());
        dto.setCiudad(e.getCiudad());
        dto.setSector(e.getSector());
        dto.setDescripcion(e.getDescripcion());
        dto.setSitioWeb(e.getSitioWeb());
        dto.setNumeroEmpleados(e.getNumeroEmpleados());
        dto.setFiguraLegal(e.getFiguraLegal());
        dto.setLogoUrl(e.getLogo() != null ? e.getLogo().getUrl() : null);
        return dto;
    }
    private EmpresaResponseDTO toDTO(Empresa e, long vacantesActivas) {
        String logoUrl = e.getLogo() != null ? e.getLogo().getUrl() : null;

        return new EmpresaResponseDTO(
                e.getId(),
                e.getRazonSocial(),
                e.getSector(),
                e.getDescripcion(),
                e.getCiudad(),
                logoUrl,
                vacantesActivas);
    }

}
