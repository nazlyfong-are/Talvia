package com.talvia.talvia.servicesIMPL.trabajador;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talvia.talvia.dto.response.trabajador.VacanteFavoritaResponseDTO;
import com.talvia.talvia.model.proceso.VacanteFavorita;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.vacante.Vacante;
import com.talvia.talvia.repository.usuario.TrabajadorRepository;
import com.talvia.talvia.repository.vacante.VacanteFavoritaRespository;
import com.talvia.talvia.repository.vacante.VacanteRepository;
import com.talvia.talvia.services.trabajador.VacanteFavoritaService;
import com.talvia.talvia.services.vacante.VacanteService;

import jakarta.transaction.Transactional;

@Service
public class VacanteFavoritaServiceIMPL implements VacanteFavoritaService {

    @Autowired
    private VacanteFavoritaRespository favoritaRespository;
    @Autowired
    private TrabajadorRepository trabajadorRepository;
    @Autowired
    private VacanteRepository vacanteRepository;
    @Autowired
    private VacanteService vacanteService;

    @Override
    public void agregar(Long trabajadorId, Long vacanteId) {
        if (favoritaRespository.existsByTrabajadorIdAndVacanteId(trabajadorId, vacanteId)) {
            return; // ya esta guardada y no se hace nada
        }

        Trabajador trabajador = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado"));
        Vacante vacante = vacanteRepository.findById(vacanteId)
                .orElseThrow(() -> new IllegalArgumentException("Vacante no encontrada."));

        VacanteFavorita favorita = new VacanteFavorita();
        favorita.setTrabajador(trabajador);
        favorita.setVacante(vacante);
        favorita.setFechaGuardado(LocalDateTime.now());

        favoritaRespository.save(favorita);
    }

    @Override 
    @Transactional 
    public void quitar(Long trabajadorId, Long vacanteId){
        favoritaRespository.deleteByTrabajadorIdAndVacanteId(trabajadorId, vacanteId);
    }

    @Override
    public boolean esFavorita(Long trabajadorId, Long vacanteId){
        return favoritaRespository.existsByTrabajadorIdAndVacanteId(trabajadorId, vacanteId);
    }

    @Override
    public List<VacanteFavoritaResponseDTO> listar(Long trabajadorId){
        return favoritaRespository.findByTrabajadorIdOrderByFechaGuardadoDesc(trabajadorId).stream()
                    .map(f -> new VacanteFavoritaResponseDTO(f.getId(), vacanteService.toDTO(f.getVacante())))
                    .collect(Collectors.toList());
    }
}
