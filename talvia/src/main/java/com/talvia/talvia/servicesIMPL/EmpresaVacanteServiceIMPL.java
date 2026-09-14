package com.talvia.talvia.servicesIMPL;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.enums.NivelEducativo;
import com.talvia.talvia.model.usuario.Empresa;
import com.talvia.talvia.model.vacante.RequisitoVacante;
import com.talvia.talvia.model.vacante.Vacante;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talvia.talvia.dto.request.VacanteCreateDTO;
import com.talvia.talvia.dto.response.VacantesResponseDTO;
import com.talvia.talvia.repository.EmpresaRepository;
import com.talvia.talvia.repository.VacanteRepository;
import com.talvia.talvia.services.EmpresaVacanteService;
import com.talvia.talvia.services.VacanteService;

@Service
public class EmpresaVacanteServiceIMPL implements EmpresaVacanteService{

    @Autowired
    private VacanteRepository vacanteRepository;
    @Autowired
    private EmpresaRepository empresaRepository;
    @Autowired
    private VacanteService vacanteService;

    @Override
    public List<VacantesResponseDTO> listarPropias(Long empresaId){
        return vacanteRepository.findByEmpresaId(empresaId)
                .stream().map(vacanteService::toDTO).collect(Collectors.toList());
    }

    @Override
public VacantesResponseDTO crear(Long empresaId, VacanteCreateDTO dto){
    Empresa empresa = empresaRepository.findById(empresaId)
            .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

    Vacante vacante = new Vacante();
    vacante.setEmpresa(empresa);
    vacante.setTitulo(dto.getTitulo());
    vacante.setUbicacion(dto.getUbicacion());
    vacante.setArea(dto.getArea());
    vacante.setExpMinimaAnios(dto.getExpMinimaAnios());
    vacante.setModalidad(dto.getModalidad());
    vacante.setNivelCargo(dto.getNivelCargo());
    vacante.setDescripcion(dto.getDescripcion());
    vacante.setBeneficios(dto.getBeneficios());
    vacante.setEstado(EstadoVacante.ABIERTA);
    vacante.setFechaPublicacion(LocalDateTime.now());

    // Salario estructurado
    RangoSalarial presupuesto = new RangoSalarial();
    if (dto.getMontoMinimo() != null) presupuesto.setMontoMin(BigDecimal.valueOf(dto.getMontoMinimo()));
    if (dto.getMontoMaximo() != null) presupuesto.setMontoMax(BigDecimal.valueOf(dto.getMontoMaximo()));
    presupuesto.setMoneda(dto.getMoneda());
    presupuesto.setPeriodicidad(dto.getPeriodicidad());
    vacante.setPresupuesto(presupuesto);

    // Requisitos estructurados
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

    // Nivel educativo mínimo (opcional)
    if (dto.getNivelEducativoMinimo() != null && !dto.getNivelEducativoMinimo().isBlank()) {
        try {
            vacante.setNivelEducativoMinimo(NivelEducativo.valueOf(dto.getNivelEducativoMinimo()));
        } catch (IllegalArgumentException ignored) {}
    }

    return vacanteService.toDTO(vacanteRepository.save(vacante));
}

    @Override
    public void eliminar(Long empresaId, Long vacanteId){
        Vacante vacante = vacanteRepository.findById(vacanteId)
                .orElseThrow(() -> new IllegalArgumentException("Vacante no encontrada."));
        
        if(vacante.getEmpresa() == null || !vacante.getEmpresa().getId().equals(empresaId)){
            throw new IllegalArgumentException("Esa vacante no pertenece a tu empresa.");
        }
        vacanteRepository.delete(vacante);
    }

}
