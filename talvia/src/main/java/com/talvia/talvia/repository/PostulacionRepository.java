package com.talvia.talvia.repository;

import com.talvia.talvia.model.proceso.Postulacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostulacionRepository extends JpaRepository<Postulacion, Long> {
    List<Postulacion> findByTrabajadorId(Long trabajadorId);
    List<Postulacion> findByVacanteId(Long vacanteId);
    List<Postulacion> findByVacante_Empresa_IdOrderByFechaPostulacionDesc(Long empresaId);
    boolean existsByTrabajadorIdAndVacanteId(Long trabajadorId, Long vacanteId);
}