package com.talvia.talvia.repository.vacante;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talvia.talvia.model.proceso.VacanteFavorita;


public interface VacanteFavoritaRespository extends JpaRepository<VacanteFavorita, Long>{
    List<VacanteFavorita> findByTrabajadorIdOrderByFechaGuardadoDesc(Long trabajadorId);
    Optional<VacanteFavorita> findByTrabajadorIdAndVacanteId(Long trabajadorId, Long vacanteId);
    boolean existsByTrabajadorIdAndVacanteId(Long trabajadorId, Long vacanteId);
    void deleteByTrabajadorIdAndVacanteId(Long trabajadorId, Long vacanteId);
    void deleteByVacanteId(Long vacanteId);
}
