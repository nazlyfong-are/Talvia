package com.talvia.talvia.servicesIMPL;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.talvia.talvia.dto.request.CloudinaryUploadResultDTO;
import com.talvia.talvia.dto.request.EmpresaPerfilUpdateDTO;
import com.talvia.talvia.dto.response.EmpresaPerfilResponseDTO;
import com.talvia.talvia.dto.response.EmpresaResponseDTO;
import com.talvia.talvia.model.embedded.ImagenCloudinary;
import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.usuario.Empresa;
import com.talvia.talvia.repository.EmpresaRepository;
import com.talvia.talvia.repository.VacanteRepository;
import com.talvia.talvia.services.CloudinaryService;
import com.talvia.talvia.services.EmpresaService;

@Service
public class EmpresaServiceIMPL implements EmpresaService{

    @Autowired private EmpresaRepository empresaRepository;
    @Autowired private VacanteRepository vacanteRepository;
    @Autowired private CloudinaryService cloudinaryService;

    @Override
    public List<EmpresaResponseDTO> listarEmpresas() {
        List<Empresa> empresas = empresaRepository.findAll();
        return empresas.stream().map(this::toDTO).collect(Collectors.toList());
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
                vacantesActivas
        );
    }

    @Override
    public EmpresaPerfilResponseDTO obtenerPerfil(Long empresaId){
        Empresa e = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada."));
        return toPerfilDTO(e);
    }

    @Override
    public EmpresaPerfilResponseDTO actualizarPerfil(Long empresaId, EmpresaPerfilUpdateDTO dto){
        Empresa e = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada."));
        
        if(dto.getRazonSocial() != null) e.setRazonSocial(dto.getRazonSocial());
        if(dto.getCiudad() != null) e.setCiudad(dto.getCiudad());
        if(dto.getSector() != null) e.setSector(dto.getSector());
        if(dto.getDescripcion() != null) e.setDescripcion(dto.getDescripcion());
        if(dto.getSitioWeb() != null) e.setSitioWeb(dto.getSitioWeb());
        if(dto.getNumeroEmpleados() != null) e.setNumeroEmpleados(dto.getNumeroEmpleados());
        if (dto.getFiguraLegal() != null) e.setFiguraLegal(dto.getFiguraLegal());

        return toPerfilDTO(empresaRepository.save(e));
    }

    @Override
    public String actualizarLogo(Long empresaId, MultipartFile archivo) throws Exception {
        Empresa e = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada."));
        
        if(e.getLogo() != null && e.getLogo().getPublicId() != null){
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

    private EmpresaPerfilResponseDTO toPerfilDTO(Empresa e){
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
}
